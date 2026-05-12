/**
 * MK1300 V2 HID Protocol Driver
 * SAFETY: Command byte 85 (0x55) and factory reset are BLOCKED.
 */

const BLOCKED_COMMANDS = new Set([85]);
const BLOCKED_SUBCOMMANDS = [[15, 255]];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

class HIDDriver {
  constructor() {
    this.device = null;
    this.connected = false;
    this._readQueue = [];
    this._readBuffer = [];
    this.onLog = null; // callback for UI logging
  }

  log(msg) {
    console.log('[HID]', msg);
    if (this.onLog) this.onLog(msg);
  }

  async connect() {
    // IMPORTANT: Only match the vendor-specific config interface (0xFF00/0x02)
    // NOT the standard keyboard interface (0x01/0x06) — that one rejects writes!
    // Your keyboard PID is 0xFE9C (detected from debug log)
    const filters = [
      { vendorId: 0x36AE, usagePage: 0xFF00, usage: 0x02 },
      { vendorId: 0x36AE, productId: 0xFE9C, usagePage: 0xFF00, usage: 0x02 },
      { vendorId: 0x6D7B, usagePage: 0xFF00, usage: 0x02 },
      { vendorId: 0x6D7C, usagePage: 0xFF00, usage: 0x02 },
      { vendorId: 0x6D7D, usagePage: 0xFF00, usage: 0x02 },
      { vendorId: 0x6D7E, usagePage: 0xFF00, usage: 0x02 },
      { vendorId: 0x6D7F, usagePage: 0xFF00, usage: 0x02 },
      { vendorId: 0x6D80, usagePage: 0xFF00, usage: 0x02 },
      { vendorId: 0x6D81, usagePage: 0xFF00, usage: 0x02 },
      { vendorId: 0x6D82, usagePage: 0xFF00, usage: 0x02 },
      { vendorId: 0x6D83, usagePage: 0xFF00, usage: 0x02 },
      { vendorId: 0x68BD, usagePage: 0xFF00, usage: 0x02 },
      { vendorId: 0x0816, usagePage: 0xFF00, usage: 0x02 },
      { vendorId: 0x0817, usagePage: 0xFF00, usage: 0x02 },
      { vendorId: 0x0818, usagePage: 0xFF00, usage: 0x02 },
      { vendorId: 0x0819, usagePage: 0xFF00, usage: 0x02 },
      { vendorId: 0x7DFA, usagePage: 0xFF00, usage: 0x02 },
      { vendorId: 0x08A3, usagePage: 0xFF00, usage: 0x02 },
      { vendorId: 0x342D, usagePage: 0xFF00, usage: 0x02 },
      { vendorId: 0x9A9A, usagePage: 0xFF00, usage: 0x02 },
    ];

    this.log('Requesting device (looking for vendor config interface 0xFF00)...');
    const devices = await navigator.hid.requestDevice({ filters });
    if (!devices.length) throw new Error("No device selected");

    this.device = devices[0];
    this.log(`Selected: ${this.device.productName} (VID:0x${this.device.vendorId.toString(16)} PID:0x${this.device.productId.toString(16)})`);

    // Log and verify collections
    let hasVendorInterface = false;
    if (this.device.collections) {
      this.device.collections.forEach((c, i) => {
        const up = c.usagePage, u = c.usage;
        this.log(`  Collection ${i}: usagePage=0x${up.toString(16)} usage=0x${u.toString(16)}`);
        if (up === 0xFF00 && u === 0x02) hasVendorInterface = true;
      });
    }

    if (!hasVendorInterface) {
      this.log('⚠ WARNING: This device does NOT have the vendor config interface (0xFF00/0x02)!');
      this.log('  You selected the standard keyboard interface. This will NOT work.');
      this.log('  Fix: Close ALL Chrome windows, then relaunch with:');
      this.log('  chrome.exe --disable-hid-blocklist');
      this.log('  The --disable-hid-blocklist flag lets Chrome see the config interface.');
      throw new Error(
        'Wrong HID interface selected!\n\n' +
        'You connected to the standard keyboard interface (usagePage 0x01),\n' +
        'but we need the vendor config interface (usagePage 0xFF00).\n\n' +
        'Fix: Close ALL Chrome/Edge windows completely, then relaunch with:\n' +
        'chrome.exe --disable-hid-blocklist\n\n' +
        'Then try connecting again.'
      );
    }

    if (!this.device.opened) {
      this.log('Opening device...');
      await this.device.open();
    }
    this.device.addEventListener("inputreport", (e) => this._onInputReport(e));
    this.connected = true;
    this.log('✓ Device opened on vendor config interface!');

    return {
      vendorId: this.device.vendorId,
      productId: this.device.productId,
      productName: this.device.productName,
    };
  }

  disconnect() {
    if (this.device && this.device.opened) this.device.close();
    this.device = null;
    this.connected = false;
    this.log('Disconnected');
  }

  _onInputReport(e) {
    const data = new Uint8Array(e.data.buffer);
    if (this._readQueue.length > 0) {
      this._readQueue.shift()(data);
    } else {
      this._readBuffer.push(data);
    }
  }

  _read(timeoutMs = 1000) {
    if (this._readBuffer.length > 0) {
      return Promise.resolve(this._readBuffer.shift());
    }
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        const idx = this._readQueue.indexOf(handler);
        if (idx >= 0) this._readQueue.splice(idx, 1);
        resolve(null);
      }, timeoutMs);
      const handler = (data) => { clearTimeout(timer); resolve(data); };
      this._readQueue.push(handler);
    });
  }

  _safetyCheck(cmdByte, payload) {
    if (BLOCKED_COMMANDS.has(cmdByte)) {
      throw new Error(`BLOCKED: cmd ${cmdByte} (0x${cmdByte.toString(16)}) — firmware/bootloader`);
    }
    for (const blocked of BLOCKED_SUBCOMMANDS) {
      if (payload.length >= blocked.length && blocked.every((v, i) => payload[i] === v)) {
        throw new Error(`BLOCKED: sub-command [${blocked}] — factory reset`);
      }
    }
  }

  async sendCommand(cmdByte, payload = [], readResponse = true) {
    this._safetyCheck(cmdByte, payload);
    if (!this.device || !this.device.opened) throw new Error("Device not connected");

    const report = new Uint8Array(64);
    report[0] = cmdByte;
    for (let i = 0; i < payload.length && i < 63; i++) {
      report[i + 1] = payload[i];
    }

    await this.device.sendReport(0, report);

    if (readResponse) {
      const resp = await this._read(1000);
      return resp ? Array.from(resp) : [];
    }
    // Small delay even for fire-and-forget to not overwhelm MCU
    await sleep(2);
    return [];
  }

  async sendDeviceData(payload = []) {
    return this.sendCommand(6, payload, true);
  }

  async getKeyboardConfig() {
    this.log('Reading keyboard config...');
    const resp = await this.sendDeviceData([5]);
    this.log(`Config response: [${resp.slice(0, 20).join(',')}]`);
    const d = resp.slice(4, 19);
    const config = {
      version: d[1] << 8 | d[0],
      pid: d[3] << 8 | d[2],
      firmware: d[5] << 8 | d[4],
      battery: d[8],
      profileCount: d[10],
      profile: d[11],
      layerCount: d[12],
      layer: d[13],
    };
    this.log(`Version: ${config.version}, Firmware: ${config.firmware}, Profile: ${config.profile}`);
    return config;
  }

  async setHardwareAnimation(mode, brightness = 4, speed = 2, colorMode = 0, direction = 0, hsv = null) {
    this.log(`Setting hardware animation: mode=${mode}, brightness=${brightness}, speed=${speed}, colorMode=${colorMode}`);

    // Build the 11-byte config payload
    // Brightness slider (0-4) maps to HSV V value for actual LED intensity
    const brightnessToV = [30, 80, 140, 200, 236];
    const vValue = brightnessToV[brightness] || 236;

    function applyColor(config) {
      config[2] = mode;
      config[3] = brightness;
      config[4] = speed;

      if (colorMode === 1 && hsv) {
        // Custom single-color mode: flags [5]=1 [6]=1, then [7]=0, [8..10]=HSV
        config[5] = 1;
        config[6] = 1;
        config[7] = 0;
        config[8] = hsv.h;
        config[9] = hsv.s;
        config[10] = vValue;
      } else {
        // Multi/Rainbow mode: flags [5]=direction [6]=0, then [7]=8, [8..10]=defaults
        config[5] = direction;
        config[6] = 0;
        config[7] = 8;
        config[8] = 255;
        config[9] = 255;
        config[10] = vValue;
      }
    }

    // Step 1: Query and update the GLOBAL config (Type 0)
    const globalResp = await this.sendDeviceData([10]);
    this.log(`Global query response: [${globalResp.slice(0, 20).join(',')}]`);

    if (globalResp && globalResp.length >= 16) {
      const config = globalResp.slice(5, 16);
      config[0] = 0; // Type 0 = Global / Active
      config[1] = config[1]; // keep sub-type
      applyColor(config);

      this.log(`Applying Global Config: [${config.join(',')}]`);
      await this.sendDeviceData([11, config.length, 0, 0, ...config]);
    }

    // Step 2: Query and update the Mode Template (Type 1)
    const tplResp = await this.sendDeviceData([22, 0, 0, 0, 1, 0, mode]);
    if (tplResp && tplResp.length >= 16) {
      const tplConfig = tplResp.slice(5, 16);
      tplConfig[0] = 1; // Type 1 = Mode Template
      tplConfig[1] = tplConfig[1]; // keep sub-type
      applyColor(tplConfig);

      this.log(`Applying Template Config: [${tplConfig.join(',')}]`);
      await this.sendDeviceData([11, tplConfig.length, 0, 0, ...tplConfig]);
    }

    await sleep(50);
    this.log('Hardware animation set!');
  }

  async setKeyColor(keyIndex, r, g, b) {
    const offset = 3 * keyIndex;
    const packet = new Array(63).fill(0);
    packet[0] = 20;
    packet[1] = 3;
    packet[2] = offset & 0xFF;
    packet[3] = (offset >> 8) & 0xFF;
    packet[7] = r & 0xFF;
    packet[8] = g & 0xFF;
    packet[9] = b & 0xFF;
    await this.sendCommand(6, packet, false);
  }

  async setAllKeyColors(colorArray, keyCount) {
    const totalBytes = keyCount * 3;
    const chunkSize = 56;
    const chunks = Math.ceil(totalBytes / chunkSize);

    for (let i = 0; i < chunks; i++) {
      const offset = chunkSize * i;
      const remaining = totalBytes - offset;
      const thisChunk = Math.min(chunkSize, remaining);
      const isLast = i === chunks - 1;

      const packet = new Array(63).fill(0);
      packet[0] = 18;
      packet[1] = isLast && remaining % chunkSize > 0 ? (remaining % chunkSize) + 3 : chunkSize + 3;
      packet[2] = offset & 0xFF;
      packet[3] = (offset >> 8) & 0xFF;

      for (let j = 0; j < thisChunk; j++) {
        packet[7 + j] = colorArray[offset + j] || 0;
      }

      // Read response for reliability instead of fire-and-forget
      await this.sendCommand(6, packet, true);
    }
  }

  // Test method: set a single key to bright red to verify communication
  async testSingleKey() {
    this.log('Testing: Setting key 0 (Esc) to RED...');
    await this.setKeyColor(0, 255, 0, 0);
    await sleep(100);
    this.log('Testing: Setting key 43 (Q) to GREEN...');
    await this.setKeyColor(43, 0, 255, 0);
    await sleep(100);
    this.log('Testing: Setting key 44 (W) to BLUE...');
    await this.setKeyColor(44, 0, 0, 255);
    this.log('Test complete — check Esc=Red, Q=Green, W=Blue on your keyboard');
  }

  async getLightConfig() {
    const resp = await this.sendDeviceData([10]);
    const d = resp.slice(4, 16);
    return {
      type: d[0], mode: d[2], brightness: d[3],
      speed: d[4], direction: d[5], color: d[6],
    };
  }
}

export { HIDDriver };
