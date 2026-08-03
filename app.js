import { HIDDriver } from './hid-driver.js';
import { KEYBOARD_LAYOUT, KEY_COUNT, KB_WIDTH, KB_HEIGHT } from './keyboard-layout.js';
import { PATTERNS } from './effects.js';
import { EXTRA_PATTERNS } from './extra-effects.js';

const ALL_PATTERNS = [...PATTERNS, ...EXTRA_PATTERNS];


const driver = new HIDDriver();
window.driver = driver;
let currentPattern = ALL_PATTERNS[0];
let currentColors  = [];
let activeCat      = 'all';
let sendPending    = false;
let currentTab     = 'software';
let userLightMode  = 16;

// ── Categories ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all',       label: 'ALL',        icon: '◈' },
  { id: 'contrasty', label: 'CONTRASTY',  icon: '⚡' },
  { id: 'gradient',  label: 'GRADIENT',   icon: '🌈' },
  { id: 'neon',      label: 'NEON/CYBER', icon: '💜' },
  { id: 'heat',      label: 'FIRE/HEAT',  icon: '🔥' },
  { id: 'ice',       label: 'ICE/CRYO',   icon: '❄️' },
  { id: 'dark',      label: 'DARK',       icon: '🌑' },
  { id: 'pastel',    label: 'PASTEL',     icon: '🌸' },
  { id: 'metallic',  label: 'METALLIC',   icon: '🏆' },
];


// Map each pattern id → category id
const PATTERN_CAT = {
  sunset:'gradient', northern:'gradient', ocean:'gradient', vaporwave:'gradient',
  forest:'gradient', synthwave:'gradient', caribbean:'gradient', golden:'gradient',
  frost:'gradient', aurora:'gradient', coral:'gradient', frozen:'gradient',
  retrograde:'gradient', sundown:'gradient', purplehaze:'gradient',
  deepindigo:'gradient', trizone:'gradient', candy:'gradient',
  seafoam:'gradient', mintfresh:'gradient', jade:'gradient',
  flamtips:'heat', candystripes:'gradient',

  cyberpunk:'neon', matrix:'neon', storm:'neon', neonsign:'neon', holo:'neon',
  uv:'neon', neonblue:'neon', neonmint:'neon', toxic:'neon', radioact:'neon',
  lime:'neon', cyberdeck:'neon', blueprint:'neon', spectral:'neon', ir_atomic:'neon',

  ember:'heat', blood:'heat', ir_left:'heat', ir_vert:'heat', ir_solar:'heat',
  ir_corner:'heat', ir_dual:'heat', lava:'heat', hearth:'heat', volcanic:'heat',
  magmachamber:'heat', candyapple:'heat',

  arctic:'ice', deepspace:'ice', ir_cold:'ice', ir_coldwave:'ice', ir_teal:'ice',
  ir_plasma:'ice', deepteal:'ice', denim:'ice', stormcloud:'ice', aquadream:'ice',
  peacock:'ice', frozenOcean:'ice',

  dracula:'dark', noir:'dark', obsidian:'dark', nightsky2:'dark', carbon:'dark',
  highcontrast:'dark', deepwine:'dark', galaxy:'dark', nordic:'dark',
  solarized:'dark', wasd:'dark', blueprnt:'dark',

  cherry:'pastel', pastel:'pastel', cotton:'pastel', peachfuzz:'pastel',
  silver:'pastel', lavender:'pastel', orchid:'pastel', titanium:'pastel',
  sakura:'pastel', hotpink:'pastel', sandstone:'pastel', homerow:'pastel',

  rosegold:'metallic', amethyst:'metallic', moltengold:'metallic', copper:'metallic',
  bronzeage:'metallic', coppergold:'metallic',
  // Extra contrasty patterns
  checkerboard:'contrasty', cyberstripes:'contrasty', yinyang:'contrasty',
  typeglow:'contrasty',     rowneon:'contrasty',      bullseye:'contrasty',
  policelight:'contrasty',  phantom:'dark',           binary:'contrasty',
  rave:'contrasty',         disco:'contrasty',        vampire:'heat',
  stainedglass:'contrasty', lasergrid:'neon',         diagstripes:'contrasty',
  flamerow:'heat',          voidportal:'dark',        sunrisefire:'heat',
  neobluprint:'neon',       cherrybomb:'heat',        toxicrain:'neon',
  pinstripe:'contrasty',    glitch:'dark',            heatzone:'heat',
  icespike:'ice',           acidwash:'neon',          neontetris:'contrasty',
  camo:'dark',              deepmagma:'heat',         frozentundra:'ice',
  rowcheck:'contrasty',     neoncross:'neon',         horror:'dark',
  neonstrip2:'contrasty',   goldrush:'metallic',      rainbowdiag:'contrasty',
  acidcheck:'contrasty',    spotlightesc:'dark',      neonrowalt:'contrasty',
  emberwaves:'heat',        neonblocks:'contrasty',   uwistripe:'contrasty',
  midnightfire:'heat',      lavacheck:'heat',         frostbite:'ice',
  hotspots:'heat',          pixelflag:'contrasty',    spectrumcross:'contrasty',
  deepcherry:'pastel',      elecfence:'contrasty',
};

function catOf(id) { return PATTERN_CAT[id] || 'gradient'; }

// ── DOM refs ─────────────────────────────────────────────────────────────────
const connectBtn    = document.getElementById('connect-btn');
const statusDot     = document.getElementById('status-dot');
const statusText    = document.getElementById('status-text');
const deviceInfo    = document.getElementById('device-info');
const kbContainer   = document.getElementById('keyboard');
const patternsGrid  = document.getElementById('patterns-grid');
const logPanel      = document.getElementById('log-panel');
const bSlider       = document.getElementById('brightness-slider');
const bVal          = document.getElementById('brightness-val');
const patternName   = document.getElementById('pattern-name');
const catStrip      = document.getElementById('cat-strip');
const patternCount  = document.getElementById('pattern-count');

const userLightToggle = document.getElementById('userlight-toggle');

// Hardware UI elements
const tabSoftware   = document.getElementById('tab-software');
const tabHardware   = document.getElementById('tab-hardware');
const panelSoftware = document.getElementById('software-panel');
const panelHardware = document.getElementById('hardware-panel');

const hwMode        = document.getElementById('hw-mode');
const hwSpeed       = document.getElementById('hw-speed');
const hwBright      = document.getElementById('hw-bright');
const hwColorPicker = document.getElementById('hw-color-picker');
const hwSwatches    = document.getElementById('hw-swatches');
const hwSpeedVal    = document.getElementById('hw-speed-val');
const hwBrightVal   = document.getElementById('hw-bright-val');
const audioVizBtn   = document.getElementById('audio-viz-btn');

// ── Logging ───────────────────────────────────────────────────────────────────
function log(msg) {
  const line = document.createElement('div');
  line.textContent = `> ${msg}`;
  logPanel.appendChild(line);
  logPanel.scrollTop = logPanel.scrollHeight;
  while (logPanel.children.length > 50) logPanel.removeChild(logPanel.firstChild);
}
driver.onLog = log;

// ── Keyboard viz ─────────────────────────────────────────────────────────────
function buildKeyboard() {
  const frame   = kbContainer.closest('.crt-frame');
  // 6px padding each side inside the frame = 12px total
  const availW  = (frame ? frame.clientWidth : 284) - 12;
  const scale   = Math.max(8, Math.min(availW / KB_WIDTH, 48));
  kbContainer.style.width  = `${KB_WIDTH  * scale}px`;
  kbContainer.style.height = `${KB_HEIGHT * scale}px`;
  kbContainer.innerHTML = '';
  KEYBOARD_LAYOUT.forEach(key => {
    const el = document.createElement('div');
    el.className = 'key';
    el.dataset.index = key.index;
    el.style.left   = `${key.x * scale}px`;
    el.style.top    = `${key.y * scale}px`;
    el.style.width  = `${key.w * scale - 2}px`;
    el.style.height = `${key.h * scale - 2}px`;
    el.textContent  = key.name;
    kbContainer.appendChild(el);
  });
  if (currentColors.length) applyViz(currentColors);
}

function applyViz(colors) {
  KEYBOARD_LAYOUT.forEach((key, i) => {
    const el = kbContainer.querySelector(`[data-index="${key.index}"]`);
    if (!el || !colors[i]) return;
    const {r,g,b} = colors[i];
    el.style.backgroundColor = `rgb(${r},${g},${b})`;
    const bright = Math.max(r,g,b);
    el.style.boxShadow = bright > 20
      ? `0 0 ${Math.round(bright/14)}px rgba(${r},${g},${b},0.7)`
      : 'none';
  });
}

// ── Pattern logic ─────────────────────────────────────────────────────────────
function computeColors(p) {
  const br = parseInt(bSlider.value) / 100;
  return p.fn(KEYBOARD_LAYOUT).map(c => ({
    r: Math.round(c.r * br),
    g: Math.round(c.g * br),
    b: Math.round(c.b * br),
  }));
}

async function applyPattern(p, sendToHW = true) {
  currentPattern = p;
  patternName.textContent = p.name.toUpperCase();
  document.querySelectorAll('.effect-card').forEach(c =>
    c.classList.toggle('active', c.dataset.id === p.id)
  );
  currentColors = computeColors(p);
  applyViz(currentColors);
  if (!sendToHW || !driver.connected || currentTab !== 'software') return;
  if (sendPending) return;
  sendPending = true;
  await new Promise(r => setTimeout(r, 40));
  sendPending = false;
  try {
    const flat = new Array(KEY_COUNT * 3).fill(0);
    KEYBOARD_LAYOUT.forEach((key, i) => {
      if (currentColors[i]) {
        flat[key.index * 3]     = currentColors[i].r;
        flat[key.index * 3 + 1] = currentColors[i].g;
        flat[key.index * 3 + 2] = currentColors[i].b;
      }
    });
    await driver.setAllKeyColors(flat, KEY_COUNT);
    if (!vizActive) log(`OK: "${p.name}" applied`);
  } catch(e) { if (!vizActive) log(`ERR: ${e.message}`); }
}

// ── Category tabs ─────────────────────────────────────────────────────────────
function buildCatTabs() {
  catStrip.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `cat-tab${cat.id === activeCat ? ' active' : ''}`;
    btn.dataset.cat = cat.id;
    btn.textContent = `${cat.icon} ${cat.label}`;
    btn.addEventListener('click', () => {
      activeCat = cat.id;
      buildCatTabs();
      buildGrid();
      saveSettings();
    });
    catStrip.appendChild(btn);
  });
}

// ── Patterns grid ─────────────────────────────────────────────────────────────
function buildGrid() {
  const filtered = activeCat === 'all'
    ? ALL_PATTERNS
    : ALL_PATTERNS.filter(p => catOf(p.id) === activeCat);

  patternCount.textContent = `${filtered.length} PATTERNS`;
  patternsGrid.innerHTML = '';
  filtered.forEach(p => {
    const card = document.createElement('div');
    card.className = `effect-card${p.id === currentPattern.id ? ' active' : ''}`;
    card.dataset.id = p.id;
    card.innerHTML = `<span class="effect-icon">${p.icon}</span><span class="effect-name">${p.name}</span>`;
    card.addEventListener('click', () => {
      applyPattern(p, true);
      saveSettings();
    });
    patternsGrid.appendChild(card);
  });

}

// ── Audio Visualizer ──────────────────────────────────────────────────────────
let audioCtx = null;
let analyser = null;
let micStream = null;
let vizActive = false;
let vizAnimationFrame = null;

function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) r = g = b = l;
  else {
    const hue2rgb = (p, q, t) => {
      if(t < 0) t += 1;
      if(t > 1) t -= 1;
      if(t < 1/6) return p + (q - p) * 6 * t;
      if(t < 1/2) return q;
      if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [r * 255, g * 255, b * 255];
}

async function toggleAudioViz() {
  if (!driver.connected || currentTab !== 'software') return;
  if (vizActive) {
    vizActive = false;
    cancelAnimationFrame(vizAnimationFrame);
    if (micStream) micStream.getTracks().forEach(t => t.stop());
    if (audioCtx) await audioCtx.close();
    audioCtx = null;
    micStream = null;
    analyser = null;
    audioVizBtn.textContent = '[ MIC/AUDIO VISUALIZER: OFF ]';
    audioVizBtn.style.color = '#ff00ff';
    applyPattern(currentPattern, true); // reapply static pattern
    return;
  }

  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64; 
    const source = audioCtx.createMediaStreamSource(micStream);
    source.connect(analyser);
    
    vizActive = true;
    audioVizBtn.textContent = '[ MIC/AUDIO VISUALIZER: ON (LISTENING...) ]';
    audioVizBtn.style.color = '#00ff00';
    renderAudioViz();
  } catch (err) {
    log('MIC ERROR: ' + err.message);
  }
}

function renderAudioViz() {
  if (!vizActive) return;
  vizAnimationFrame = requestAnimationFrame(renderAudioViz);
  if (sendPending || !driver.connected) return;
  
  const data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);
  
  currentColors = new Array(KEY_COUNT).fill({r:0,g:0,b:0});
  
  KEYBOARD_LAYOUT.forEach((key, i) => {
    // Map X coordinate to bass-mid frequencies
    const binIdx = Math.floor((key.x / KB_WIDTH) * 24); 
    const val = data[binIdx] || 0;
    
    if (val > 40) {
      const hue = (binIdx * 15) % 360;
      // Use fixed 0.5 lightness for pure color, then scale RGB by intensity
      const rgb = hslToRgb(hue / 360, 1, 0.5);
      const intensity = val / 255;
      
      const heightFactor = key.y / KB_HEIGHT;
      if (intensity > (1 - heightFactor) - 0.2) {
        currentColors[i] = { 
          r: Math.round(rgb[0] * intensity), 
          g: Math.round(rgb[1] * intensity), 
          b: Math.round(rgb[2] * intensity) 
        };
      } else {
        currentColors[i] = {r:0,g:0,b:0};
      }
    } else {
      currentColors[i] = {r:0,g:0,b:0};
    }
  });
  
  applyViz(currentColors);
  
  sendPending = true;
  const flat = new Array(KEY_COUNT * 3).fill(0);
  KEYBOARD_LAYOUT.forEach((key, i) => {
    if (currentColors[i]) {
      flat[key.index * 3]     = currentColors[i].r;
      flat[key.index * 3 + 1] = currentColors[i].g;
      flat[key.index * 3 + 2] = currentColors[i].b;
    }
  });
  
  driver.setAllKeyColors(flat, KEY_COUNT).then(() => {
    sendPending = false;
  }).catch(() => {
    sendPending = false;
  });
}



// ── Connect ───────────────────────────────────────────────────────────────────
async function connectDevice() {
  connectBtn.disabled = true;
  connectBtn.textContent = '[ CONNECTING... ]';
  try {
    const info = await driver.connect();
    statusDot.className = 'dot dot-on';
    statusText.textContent = 'ONLINE';
    deviceInfo.textContent = `${info.productName || 'KB'} | VID:${info.vendorId.toString(16).toUpperCase()}`;
    connectBtn.textContent = '[ CONNECTED ]';
    audioVizBtn.style.display = 'block';
    try {
      if (currentTab === 'software') {
        // mode 16 or 20 is Custom Mode (UserLight) 
        await driver.setHardwareAnimation(userLightMode, 4);
        log('OK: custom RGB mode active');
        await applyPattern(currentPattern, true);
      } else if (currentTab === 'custom') {
        await driver.setHardwareAnimation(userLightMode, 4);
        log('OK: custom RGB mode active');
        buildCustomKeyboard();
        await pushCustomToHW();
      } else {
        await updateHardwareLight();
      }
    } catch(e) { log('WARN: ' + e.message); }

  } catch(e) {
    statusDot.className = 'dot dot-off';
    statusText.textContent = 'OFFLINE';
    connectBtn.textContent = '[ CONNECT ]';
    connectBtn.disabled = false;
    log('ERR: ' + e.message);
  }
}

// ── Events ────────────────────────────────────────────────────────────────────
connectBtn.addEventListener('click', connectDevice);
audioVizBtn.addEventListener('click', toggleAudioViz);

userLightToggle.addEventListener('change', async () => {
  userLightMode = userLightToggle.checked ? 20 : 16;
  
  // Update hardware tab dropdown select option for UserLight
  const opt = document.getElementById('hw-mode-userlight');
  if (opt) {
    const wasSelected = (hwMode.value === '16' || hwMode.value === '20');
    opt.value = userLightMode.toString();
    opt.textContent = `${userLightMode}: UserLight`;
    if (wasSelected) {
      hwMode.value = userLightMode.toString();
    }
  }
  
  saveSettings();
  
  // Re-apply settings if currently connected to device
  if (driver.connected) {
    try {
      if (currentTab === 'software') {
        await driver.setHardwareAnimation(userLightMode, 4);
        await applyPattern(currentPattern, true);
      } else if (currentTab === 'custom') {
        await driver.setHardwareAnimation(userLightMode, 4);
        await pushCustomToHW();
      } else if (currentTab === 'hardware') {
        await updateHardwareLight();
      }
    } catch(e) {
      log('ERR: ' + e.message);
    }
  }
});

bSlider.addEventListener('input', () => {
  bVal.textContent = bSlider.value;
  applyPattern(currentPattern, driver.connected);
  saveSettings();
});

function hexToHsv(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  let r = ((n >> 16) & 255) / 255;
  let g = ((n >> 8) & 255) / 255;
  let b = (n & 255) / 255;
  
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 255), s: Math.round(s * 255), v: Math.round(v * 255) };
}

let hwCurrentColorHex = 'multi';

function highlightHwSwatch() {
  hwSwatches.querySelectorAll('.swatch').forEach(s => {
    s.classList.toggle('active-swatch', s.dataset.color.toLowerCase() === hwCurrentColorHex.toLowerCase());
  });
}

hwColorPicker.addEventListener('input', () => {
  hwCurrentColorHex = hwColorPicker.value;
  highlightHwSwatch();
  updateHardwareLight();
  saveSettings();
});

hwSwatches.addEventListener('click', (e) => {
  const swatch = e.target.closest('.swatch');
  if (!swatch) return;
  hwCurrentColorHex = swatch.dataset.color;
  if (hwCurrentColorHex !== 'multi') {
    hwColorPicker.value = hwCurrentColorHex;
  }
  highlightHwSwatch();
  updateHardwareLight();
  saveSettings();
});

async function updateHardwareLight() {
  if (!driver.connected || currentTab !== 'hardware') return;
  const mode = parseInt(hwMode.value, 10);
  const speed = parseInt(hwSpeed.value, 10);
  const bright = parseInt(hwBright.value, 10);
  
  try {
    if (hwCurrentColorHex === 'multi') {
      await driver.setHardwareAnimation(mode, bright, speed, 0, 0, null);
    } else {
      const hsv = hexToHsv(hwCurrentColorHex);
      await driver.setHardwareAnimation(mode, bright, speed, 1, 0, hsv);
    }
  } catch(e) {
    log('HW ERR: ' + e.message);
  }
}

// ── Tab switching ────────────────────────────────────────────────────────────
const tabCustom    = document.getElementById('tab-custom');
const panelCustom  = document.getElementById('custom-panel');

function switchTab(tab) {
  currentTab = tab;
  tabSoftware.classList.toggle('active', tab === 'software');
  tabHardware.classList.toggle('active', tab === 'hardware');
  tabCustom.classList.toggle('active', tab === 'custom');
  panelSoftware.style.display = tab === 'software' ? 'block' : 'none';
  panelHardware.style.display = tab === 'hardware' ? 'block' : 'none';
  panelCustom.style.display   = tab === 'custom'   ? 'block' : 'none';
  
  saveSettings();

  if (driver.connected) {
    if (tab === 'software') {
      driver.setHardwareAnimation(userLightMode, 4).then(() => applyPattern(currentPattern, true));
    } else if (tab === 'hardware') {
      updateHardwareLight();
    } else if (tab === 'custom') {
      driver.setHardwareAnimation(userLightMode, 4).then(() => {
        buildCustomKeyboard();
        pushCustomToHW();
      });
    }
  } else if (tab === 'custom') {
    buildCustomKeyboard();
  }
}

tabSoftware.addEventListener('click', () => switchTab('software'));
tabHardware.addEventListener('click', () => switchTab('hardware'));
tabCustom.addEventListener('click', () => switchTab('custom'));

hwMode.addEventListener('change', () => {
  updateHardwareLight();
  saveSettings();
});
hwSpeed.addEventListener('input', () => {
  hwSpeedVal.textContent = hwSpeed.value;
  updateHardwareLight();
  saveSettings();
});
hwBright.addEventListener('input', () => {
  hwBrightVal.textContent = hwBright.value;
  updateHardwareLight();
  saveSettings();
});

// ══════════════════════════════════════════════════════════════════════════════
// ── CUSTOM PRESET EDITOR ─────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const customKb         = document.getElementById('custom-keyboard');
const customColorPicker = document.getElementById('custom-color-picker');
const customSwatches   = document.getElementById('custom-swatches');
const customFill       = document.getElementById('custom-fill');
const customImport     = document.getElementById('custom-import');
const customClear      = document.getElementById('custom-clear');
const customUndo       = document.getElementById('custom-undo');
const customPush       = document.getElementById('custom-push');
const customAutoPush   = document.getElementById('custom-autopush');
const customBrightSlider = document.getElementById('custom-bright-slider');
const customBrightVal    = document.getElementById('custom-bright-val');
const customSelectCount = document.getElementById('custom-select-count');
const profileNameInput = document.getElementById('profile-name');
const profileSaveBtn   = document.getElementById('profile-save');
const profileExportBtn = document.getElementById('profile-export');
const profileImportInput = document.getElementById('profile-import');
const profileList      = document.getElementById('profile-list');

// Per-key color array for the custom editor
let customColors = KEYBOARD_LAYOUT.map(() => ({ r: 0, g: 0, b: 0 }));
let selectedKeys = new Set(); // indices into KEYBOARD_LAYOUT
let undoStack = []; // snapshots of customColors
const MAX_UNDO = 30;

// Painting state
let isDragging = false;
let paintColor = { r: 255, g: 45, b: 120 }; // matches default picker #ff2d78

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function saveUndoState() {
  undoStack.push(customColors.map(c => ({ ...c })));
  if (undoStack.length > MAX_UNDO) undoStack.shift();
}

// ── Build the interactive keyboard ──────────────────────────────────────────
function buildCustomKeyboard() {
  const wrapWidth = customKb.parentElement.clientWidth - 40; // 20px margin each side
  const scale = Math.max(16, Math.min(wrapWidth / KB_WIDTH, 42));
  customKb.style.width  = `${KB_WIDTH * scale}px`;
  customKb.style.height = `${KB_HEIGHT * scale}px`;
  customKb.innerHTML = '';

  KEYBOARD_LAYOUT.forEach((key, i) => {
    const el = document.createElement('div');
    el.className = 'custom-key';
    el.dataset.idx = i;
    el.style.left   = `${key.x * scale}px`;
    el.style.top    = `${key.y * scale}px`;
    el.style.width  = `${key.w * scale - 2}px`;
    el.style.height = `${key.h * scale - 2}px`;
    el.style.fontSize = `${Math.max(9, scale * 0.55)}px`;
    el.textContent  = key.name;
    
    const c = customColors[i] || { r: 0, g: 0, b: 0 };
    el.style.backgroundColor = `rgb(${c.r},${c.g},${c.b})`;
    if (Math.max(c.r, c.g, c.b) > 20) {
      el.style.boxShadow = `0 0 ${Math.round(Math.max(c.r,c.g,c.b)/14)}px rgba(${c.r},${c.g},${c.b},0.5)`;
    }

    // Mouse events for painting
    el.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return; // Only left click for painting
      e.preventDefault();
      isDragging = true;
      if (!e.ctrlKey && !e.shiftKey) selectedKeys.clear();
      selectedKeys.add(i);
      updateCustomKeySelection();
    });

    el.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const c = customColors[i] || { r: 0, g: 0, b: 0 };
      paintColor = { r: c.r, g: c.g, b: c.b };
      customColorPicker.value = rgbToHex(c.r, c.g, c.b);
      highlightActiveSwatch();
      log('Picked color: ' + customColorPicker.value);
    });
    el.addEventListener('mouseenter', () => {
      if (isDragging) {
        selectedKeys.add(i);
        updateCustomKeySelection();
      }
    });

    customKb.appendChild(el);
  });
}

// On mouseup anywhere: apply paint to selected keys
document.addEventListener('mouseup', () => {
  if (isDragging && selectedKeys.size > 0) {
    isDragging = false;
    applyPaintToSelected();
  }
  isDragging = false;
});

function updateCustomKeySelection() {
  customKb.querySelectorAll('.custom-key').forEach(el => {
    const idx = parseInt(el.dataset.idx);
    el.classList.toggle('selected', selectedKeys.has(idx));
  });
  customSelectCount.textContent = selectedKeys.size > 0 ? `(${selectedKeys.size} SELECTED)` : '';
}

function applyPaintToSelected() {
  if (selectedKeys.size === 0) return;
  saveUndoState();
  for (const idx of selectedKeys) {
    customColors[idx] = { ...paintColor };
  }
  refreshCustomKeyboard();
  selectedKeys.clear();
  updateCustomKeySelection();
  if (customAutoPush.checked) pushCustomToHW();
  saveSettings();
}

function getCustomColorsWithBrightness() {
  const br = parseInt(customBrightSlider.value) / 100;
  return customColors.map(c => ({
    r: Math.min(255, Math.round(c.r * br)),
    g: Math.min(255, Math.round(c.g * br)),
    b: Math.min(255, Math.round(c.b * br)),
  }));
}

function refreshCustomKeyboard() {
  const brightColors = getCustomColorsWithBrightness();
  customKb.querySelectorAll('.custom-key').forEach(el => {
    const i = parseInt(el.dataset.idx);
    const c = brightColors[i] || { r: 0, g: 0, b: 0 };
    el.style.backgroundColor = `rgb(${c.r},${c.g},${c.b})`;
    const bright = Math.max(c.r, c.g, c.b);
    el.style.boxShadow = bright > 20
      ? `0 0 ${Math.round(bright/14)}px rgba(${c.r},${c.g},${c.b},0.5)`
      : 'none';
  });
  // Also update sidebar preview
  applyViz(brightColors);
}

async function pushCustomToHW() {
  if (!driver.connected) return;
  if (sendPending) return;
  sendPending = true;
  try {
    const brightColors = getCustomColorsWithBrightness();
    const flat = new Array(KEY_COUNT * 3).fill(0);
    KEYBOARD_LAYOUT.forEach((key, i) => {
      if (brightColors[i]) {
        flat[key.index * 3]     = brightColors[i].r;
        flat[key.index * 3 + 1] = brightColors[i].g;
        flat[key.index * 3 + 2] = brightColors[i].b;
      }
    });
    await driver.setAllKeyColors(flat, KEY_COUNT);
    log('OK: Custom preset pushed');
  } catch(e) {
    log('ERR: ' + e.message);
  }
  sendPending = false;
}

// ── Color picker & swatches ──────────────────────────────────────────────────
customColorPicker.addEventListener('input', () => {
  paintColor = hexToRgb(customColorPicker.value);
  highlightActiveSwatch();
  saveSettings();
});

customSwatches.addEventListener('click', (e) => {
  const swatch = e.target.closest('.swatch');
  if (!swatch) return;
  const hex = swatch.dataset.color;
  paintColor = hexToRgb(hex);
  customColorPicker.value = hex;
  highlightActiveSwatch();
  saveSettings();
});

function highlightActiveSwatch() {
  const hex = rgbToHex(paintColor.r, paintColor.g, paintColor.b).toLowerCase();
  customSwatches.querySelectorAll('.swatch').forEach(s => {
    s.classList.toggle('active-swatch', s.dataset.color.toLowerCase() === hex);
  });
}

customAutoPush.addEventListener('change', saveSettings);
customBrightSlider.addEventListener('input', () => {
  customBrightVal.textContent = customBrightSlider.value;
  refreshCustomKeyboard();
  if (customAutoPush.checked) pushCustomToHW();
  saveSettings();
});

// ── Action buttons ──────────────────────────────────────────────────────────
customFill.addEventListener('click', () => {
  saveUndoState();
  customColors = KEYBOARD_LAYOUT.map(() => ({ ...paintColor }));
  refreshCustomKeyboard();
  if (customAutoPush.checked) pushCustomToHW();
  saveSettings();
  log('Filled all keys');
});

customImport.addEventListener('click', () => {
  saveUndoState();
  // Import RAW colors (at full brightness)
  const colors = currentPattern.fn(KEYBOARD_LAYOUT).map(c => ({
    r: Math.round(c.r),
    g: Math.round(c.g),
    b: Math.round(c.b),
  }));
  customColors = colors.map(c => ({ ...c }));
  refreshCustomKeyboard();
  if (customAutoPush.checked) pushCustomToHW();
  saveSettings();
  log(`Imported "${currentPattern.name}" at full brightness`);
});

customClear.addEventListener('click', () => {
  saveUndoState();
  customColors = KEYBOARD_LAYOUT.map(() => ({ r: 0, g: 0, b: 0 }));
  refreshCustomKeyboard();
  if (customAutoPush.checked) pushCustomToHW();
  saveSettings();
  log('Cleared all keys');
});

customUndo.addEventListener('click', () => {
  if (undoStack.length === 0) { log('Nothing to undo'); return; }
  customColors = undoStack.pop();
  refreshCustomKeyboard();
  if (customAutoPush.checked) pushCustomToHW();
  saveSettings();
  log('Undo applied');
});

customPush.addEventListener('click', () => pushCustomToHW());

// ══════════════════════════════════════════════════════════════════════════════
// ── PRESET GENERATOR ─────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const genToggle    = document.getElementById('gen-toggle');
const genArrow     = document.getElementById('gen-arrow');
const genBody      = document.getElementById('gen-body');
const genStyle     = document.getElementById('gen-style');
const genDirection = document.getElementById('gen-direction');
const genGenerate  = document.getElementById('gen-generate');
const genSurprise  = document.getElementById('gen-surprise');
const genReroll    = document.getElementById('gen-reroll');

let lastGenSeed = Date.now();

// Toggle panel
genToggle.addEventListener('click', () => {
  const open = genBody.style.display === 'none';
  genBody.style.display = open ? 'block' : 'none';
  genArrow.classList.toggle('open', open);
});

// ── HSL helper (local to generator) ─────────────────────────────────────────
function genHsl(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(1, s));
  l = Math.max(0, Math.min(1, l));
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r, g, b;
  if (h < 60)       { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else              { r = c; g = 0; b = x; }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

// Blend two colors by t (0-1)
function lerpColor(a, b, t) {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}

// Blend across a palette array by t (0-1)
function samplePalette(palette, t) {
  t = Math.max(0, Math.min(1, t));
  const idx = t * (palette.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.min(lo + 1, palette.length - 1);
  const frac = idx - lo;
  return lerpColor(palette[lo], palette[hi], frac);
}

// Seeded pseudo-random for reproducible results
function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Get key position as 0-1 based on direction
function getKeyT(key, direction, rand) {
  const kx = (key.x + key.w / 2) / KB_WIDTH;
  const ky = (key.y + key.h / 2) / KB_HEIGHT;
  switch (direction) {
    case 'horizontal':     return kx;
    case 'horizontal-rev': return 1 - kx;
    case 'vertical':       return ky;
    case 'vertical-rev':   return 1 - ky;
    case 'diagonal':       return (kx * 0.6 + ky * 0.4);
    case 'diagonal-rev':   return 1 - (kx * 0.6 + ky * 0.4);
    case 'radial': {
      const dx = kx - 0.5, dy = ky - 0.5;
      return Math.min(1, Math.sqrt(dx * dx + dy * dy) * 2);
    }
    case 'radial-rev': {
      const dx = kx - 0.5, dy = ky - 0.5;
      return 1 - Math.min(1, Math.sqrt(dx * dx + dy * dy) * 2);
    }
    case 'corner-tl': {
      return Math.min(1, Math.sqrt(kx * kx + ky * ky) / Math.sqrt(2) * 1.5);
    }
    case 'corner-br': {
      const dx = 1 - kx, dy = 1 - ky;
      return Math.min(1, Math.sqrt(dx * dx + dy * dy) / Math.sqrt(2) * 1.5);
    }
    case 'wave': {
      // Sine wave across x, modulated by y
      return (Math.sin(kx * Math.PI * 3 + ky * 2) * 0.5 + 0.5);
    }
    case 'rows':    return ky;  // snaps per row via palette sampling
    case 'columns': return kx;  // snaps per column via palette sampling
    case 'checker': {
      const col = Math.floor(key.x + key.w / 2);
      const row = Math.round(key.y);
      return ((col + row) % 2 === 0) ? 0 : 1;
    }
    case 'random':  return rand();
    default:        return kx;
  }
}

// ── Curated palettes for themed generators ──────────────────────────────────

function getThemedPalette(style, baseHue) {
  const p = (...hexes) => hexes.map(hex => hexToRgb(hex));
  switch (style) {
    case 'gradient':      return [genHsl(baseHue, 0.68, 0.44), genHsl(baseHue + 28, 0.72, 0.52), genHsl(baseHue + 58, 0.66, 0.46)];
    case 'analogous':     return [genHsl(baseHue - 20, 0.62, 0.42), genHsl(baseHue, 0.76, 0.52), genHsl(baseHue + 20, 0.62, 0.42)];
    case 'complementary': return [genHsl(baseHue, 0.74, 0.48), genHsl(baseHue + 180, 0.62, 0.44)];
    case 'triadic':       return [genHsl(baseHue, 0.66, 0.47), genHsl(baseHue + 120, 0.62, 0.44), genHsl(baseHue + 240, 0.64, 0.47)];
    case 'split':         return [genHsl(baseHue, 0.74, 0.48), genHsl(baseHue + 150, 0.62, 0.44), genHsl(baseHue + 210, 0.62, 0.44)];
    case 'sunset':        return p('#2a1a3a', '#62306f', '#bf4c79', '#ff7b54', '#ffd166');
    case 'ocean':         return p('#081a2f', '#0d3b66', '#1e6091', '#2a9d8f', '#79d0d5');
    case 'forest':        return p('#0f2b1d', '#1b5e20', '#2f7d32', '#74a33c', '#d5c96d');
    case 'ice':           return p('#102a43', '#1f6f8b', '#5fa8d3', '#9bd1e5', '#dff6ff');
    case 'lava':          return p('#1f130f', '#672017', '#ad3b1f', '#f46f2b', '#ffd28a');
    case 'heatmap':       return p('#1b1d2b', '#4c1d3d', '#b13e53', '#f57c51', '#ffd166');
    case 'neon':          return p('#171125', '#4f2f8f', '#e44cc7', '#31d7ff');
    case 'cyberpunk':     return p('#120a24', '#442d85', '#e83ca8', '#27d3f2');
    case 'retrowave':     return p('#170f35', '#4b2a7f', '#cc3f8a', '#45b0f0');
    case 'pastel':        return p('#ffd9ec', '#ffe8c2', '#d7f4e4', '#d6e9ff', '#e9ddff');
    case 'monochrome':    return [genHsl(baseHue, 0.28, 0.14), genHsl(baseHue, 0.36, 0.30), genHsl(baseHue, 0.44, 0.46), genHsl(baseHue, 0.38, 0.62)];
    case 'galaxy':        return p('#0e1024', '#32205f', '#6a2d91', '#c251a7', '#79b3ff');
    case 'aurora':        return p('#0a1f2f', '#125b68', '#1e9d6d', '#66d17a', '#b66ce5');
    case 'volcanic':      return p('#171312', '#3a1f1a', '#7d2f1c', '#cf5a2c', '#ffb15c');
    case 'stealth':       return p('#0a0d11', '#141a22', '#1c2733', '#263545');
    case 'candy':         return p('#ff6f91', '#ff9671', '#ffc75f', '#7ad7a1', '#66c7ff');
    case 'rgbwave':       return p('#ff4d4d', '#ffa940', '#fadb14', '#52c41a', '#13c2c2', '#2f54eb', '#b37feb');
    case 'matrixrain':    return p('#08160c', '#0f3a1b', '#1d7d34', '#63d66b');
    case 'starfield':     return p('#050812', '#0d1326', '#182445', '#8db4ff');
    case 'zoneaccent':    return [genHsl(baseHue, 0.72, 0.52), genHsl(baseHue + 180, 0.58, 0.46)];
    default:              return [genHsl(baseHue, 0.66, 0.46), genHsl(baseHue + 52, 0.60, 0.48)];
  }
}// -- Main generation function ------------------------------------------------

function generatePreset(style, direction, seed) {
  const rand = seededRandom(seed);
  const baseHue = Math.floor(rand() * 360);
  const palette = getThemedPalette(style, baseHue);
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const smooth = t => t * t * (3 - 2 * t);

  if (style === 'zoneaccent') {
    const accentColor = palette[0];
    const secondColor = palette[1];
    const MODS = new Set(['Esc','Tab','Caps','Shift','Ctrl','Win','Alt','Menu','Fn','?','←','?','Enter','Space']);
    const NUMS = new Set(['1','2','3','4','5','6','7','8','9','0','-','=']);
    return KEYBOARD_LAYOUT.map(key => {
      if (MODS.has(key.name)) return accentColor;
      if (NUMS.has(key.name)) return lerpColor(accentColor, secondColor, 0.5);
      return genHsl(baseHue, 0.28, 0.12 + rand() * 0.03);
    });
  }

  return KEYBOARD_LAYOUT.map(key => {
    const kx = (key.x + key.w / 2) / KB_WIDTH;
    const ky = (key.y + key.h / 2) / KB_HEIGHT;
    let t = getKeyT(key, direction, rand);
    let jitter = (rand() - 0.5) * 0.015;

    if (direction === 'rows') {
      t = Math.round(key.y) / 4;
      jitter = (rand() - 0.5) * 0.01;
    } else if (direction === 'columns') {
      t = Math.floor(key.x + key.w / 2) / 14;
      jitter = (rand() - 0.5) * 0.01;
    } else if (direction === 'checker') {
      t = t ? 0.72 : 0.28;
      jitter = 0;
    } else if (direction === 'random') {
      t = clamp01((Math.sin(kx * 9.5 + ky * 6.2 + seed * 0.00001) * 0.5 + 0.5) * 0.7 + rand() * 0.3);
    }

    if (style === 'starfield') {
      const star = rand();
      if (star > 0.965) return lerpColor(palette[2], palette[3], 0.75 + rand() * 0.25);
      if (star > 0.92) return lerpColor(palette[1], palette[3], 0.35 + rand() * 0.3);
      const deep = clamp01(0.1 + t * 0.25 + (rand() - 0.5) * 0.03);
      return samplePalette(palette, deep);
    }

    if (style === 'matrixrain') {
      const drip = clamp01(ky * 0.65 + Math.sin(kx * 8 + seed * 0.00003) * 0.2 + rand() * 0.15);
      return samplePalette(palette, drip);
    }

    if (style === 'volcanic') {
      const fissure = Math.abs(Math.sin(kx * 12.3 + ky * 5.7 + seed * 0.00002));
      const heat = clamp01((fissure - 0.35) * 1.4 + rand() * 0.08);
      return samplePalette(palette, heat);
    }

    if (style === 'galaxy') {
      const cloud = clamp01(
        (Math.sin(kx * 6.5 + ky * 4.5 + seed * 0.00004) * 0.5 + 0.5) * 0.6 +
        (Math.sin(kx * 2.8 - ky * 9.2 + seed * 0.00002) * 0.5 + 0.5) * 0.4
      );
      return samplePalette(palette, cloud);
    }

    const adjT = clamp01(smooth(clamp01(t + jitter)));
    return samplePalette(palette, adjT);
  });
}// -- Event handlers ---------------------------------------------------------

function applyGenerated(style, direction) {
  lastGenSeed = Date.now() + Math.floor(Math.random() * 100000);
  saveUndoState();
  customColors = generatePreset(style, direction, lastGenSeed);
  refreshCustomKeyboard();
  if (customAutoPush.checked) pushCustomToHW();
  saveSettings();
  log(`Generated: ${style} (${direction})`);
}

genGenerate.addEventListener('click', () => {
  applyGenerated(genStyle.value, genDirection.value);
});

genReroll.addEventListener('click', () => {
  applyGenerated(genStyle.value, genDirection.value);
});

genSurprise.addEventListener('click', () => {
  const styles = [
    'gradient','analogous','complementary','triadic','split',
    'starfield','heatmap','ocean','neon','forest','sunset','ice','lava',
    'cyberpunk','pastel','monochrome',
    'galaxy','aurora','volcanic','retrowave','stealth','candy',
    'rgbwave','matrixrain','zoneaccent'
  ];
  const dirs = [
    'horizontal','horizontal-rev','vertical','vertical-rev',
    'diagonal','diagonal-rev','radial','radial-rev',
    'corner-tl','corner-br','wave','rows','columns','checker','random'
  ];
  const rStyle = styles[Math.floor(Math.random() * styles.length)];
  const rDir   = dirs[Math.floor(Math.random() * dirs.length)];
  genStyle.value = rStyle;
  genDirection.value = rDir;
  applyGenerated(rStyle, rDir);
});

// ══════════════════════════════════════════════════════════════════════════════
// ── PROFILES ─────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const PROFILES_KEY = 'mk1300_profiles';

function getProfiles() {
  try { return JSON.parse(localStorage.getItem(PROFILES_KEY)) || []; }
  catch { return []; }
}
function saveProfiles(profiles) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

function renderProfileList() {
  const profiles = getProfiles();
  profileList.innerHTML = '';
  if (profiles.length === 0) {
    profileList.innerHTML = '<div class="vt" style="color:var(--dim);font-size:14px;padding:8px">No saved profiles yet.</div>';
    return;
  }
  profiles.forEach((p, idx) => {
    const item = document.createElement('div');
    item.className = 'profile-item';
    
    // Mini color preview (sample every ~6th key)
    let colorDots = '';
    const step = Math.max(1, Math.floor(p.colors.length / 15));
    for (let i = 0; i < p.colors.length; i += step) {
      const c = p.colors[i];
      colorDots += `<div class="profile-color-dot" style="background:rgb(${c.r},${c.g},${c.b})"></div>`;
    }

    item.innerHTML = `
      <div class="profile-item-colors">${colorDots}</div>
      <div class="profile-item-name">${p.name}</div>
      <div class="profile-item-date">${new Date(p.createdAt).toLocaleDateString()}</div>
      <button class="profile-item-del" data-idx="${idx}" title="Delete">X</button>
    `;

    // Click to load
    item.addEventListener('click', (e) => {
      if (e.target.closest('.profile-item-del')) return;
      saveUndoState();
      customColors = p.colors.map(c => ({ ...c }));
      refreshCustomKeyboard();
      if (customAutoPush.checked) pushCustomToHW();
      log(`Loaded profile: ${p.name}`);
    });

    // Delete button
    item.querySelector('.profile-item-del').addEventListener('click', (e) => {
      e.stopPropagation();
      const profiles = getProfiles();
      profiles.splice(idx, 1);
      saveProfiles(profiles);
      renderProfileList();
      log(`Deleted profile: ${p.name}`);
    });

    profileList.appendChild(item);
  });
}

profileSaveBtn.addEventListener('click', () => {
  const name = profileNameInput.value.trim();
  if (!name) { log('Enter a profile name!'); return; }
  const profiles = getProfiles();
  // Overwrite if same name exists
  const existing = profiles.findIndex(p => p.name === name);
  const profile = {
    name,
    colors: customColors.map(c => ({ ...c })),
    createdAt: Date.now(),
  };
  if (existing >= 0) profiles[existing] = profile;
  else profiles.push(profile);
  saveProfiles(profiles);
  renderProfileList();
  profileNameInput.value = '';
  log(`Saved profile: ${name}`);
});

profileExportBtn.addEventListener('click', () => {
  const name = profileNameInput.value.trim() || 'custom_preset';
  const data = {
    name,
    colors: customColors.map(c => ({ ...c })),
    exportedAt: Date.now(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name.replace(/\s+/g, '_')}.json`;
  a.click();
  URL.revokeObjectURL(url);
  log(`Exported: ${a.download}`);
});

profileImportInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data.colors || !Array.isArray(data.colors)) throw new Error('Invalid format');
      saveUndoState();
      customColors = data.colors.map(c => ({ r: c.r || 0, g: c.g || 0, b: c.b || 0 }));
      // Pad if needed
      while (customColors.length < KEYBOARD_LAYOUT.length) customColors.push({ r: 0, g: 0, b: 0 });
      refreshCustomKeyboard();
      if (customAutoPush.checked) pushCustomToHW();
      // Also save to profiles
      const profiles = getProfiles();
      profiles.push({ name: data.name || file.name, colors: customColors.map(c => ({ ...c })), createdAt: Date.now() });
      saveProfiles(profiles);
      renderProfileList();
      log(`Imported: ${data.name || file.name}`);
    } catch (err) {
      log('Import error: ' + err.message);
    }
  };
  reader.readAsText(file);
  e.target.value = ''; // reset for re-import
});

// ── Sidebar resize ──────────────────────────────────────────────────────────
const sidebar     = document.querySelector('.sidebar');
const resizeHandle = document.getElementById('resize-handle');
let isResizing = false, resizeStartX = 0, resizeStartW = 0;

resizeHandle.addEventListener('mousedown', e => {
  isResizing   = true;
  resizeStartX = e.clientX;
  resizeStartW = sidebar.offsetWidth;
  resizeHandle.classList.add('dragging');
  document.body.style.cursor     = 'ew-resize';
  document.body.style.userSelect = 'none';
  e.preventDefault();
});
document.addEventListener('mousemove', e => {
  if (!isResizing) return;
  const newW = Math.max(200, Math.min(520, resizeStartW + e.clientX - resizeStartX));
  sidebar.style.width    = newW + 'px';
  sidebar.style.minWidth = newW + 'px';
  buildKeyboard();
});
document.addEventListener('mouseup', () => {
  if (!isResizing) return;
  isResizing = false;
  resizeHandle.classList.remove('dragging');
  document.body.style.cursor     = '';
  document.body.style.userSelect = '';
});

// ── Settings Persistence ──────────────────────────────────────────────────────
const SETTINGS_KEY = 'mk1300_rgb_settings';

function saveSettings() {
  const settings = {
    currentTab,
    activeCat,
    currentPatternId: currentPattern ? currentPattern.id : null,
    brightness: bSlider.value,
    hwMode: hwMode.value,
    hwSpeed: hwSpeed.value,
    hwBright: hwBright.value,
    hwColor: hwCurrentColorHex,
    customColors,
    paintColor,
    customAutoPush: customAutoPush.checked,
    customBrightness: customBrightSlider.value,
    hwRev20: userLightToggle.checked
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function loadSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return;
  try {
    const s = JSON.parse(raw);
    
    if (s.hwRev20 !== undefined) {
      userLightToggle.checked = s.hwRev20;
    }
    userLightMode = userLightToggle.checked ? 20 : 16;
    const opt = document.getElementById('hw-mode-userlight');
    if (opt) {
      opt.value = userLightMode.toString();
      opt.textContent = `${userLightMode}: UserLight`;
    }

    if (s.currentTab) currentTab = s.currentTab;
    if (s.activeCat) activeCat = s.activeCat;
    if (s.currentPatternId) {
      const p = ALL_PATTERNS.find(x => x.id === s.currentPatternId);
      if (p) currentPattern = p;
    }
    if (s.brightness) {
      bSlider.value = s.brightness;
      bVal.textContent = s.brightness;
    }
    
    if (s.hwMode) {
      let targetHwMode = s.hwMode;
      if (targetHwMode === '16' || targetHwMode === '20') {
        targetHwMode = userLightMode.toString();
      }
      hwMode.value = targetHwMode;
    }
    if (s.hwSpeed) {
      hwSpeed.value = s.hwSpeed;
      hwSpeedVal.textContent = s.hwSpeed;
    }
    if (s.hwBright) {
      hwBright.value = s.hwBright;
      hwBrightVal.textContent = s.hwBright;
    }
    if (s.hwColor) {
      hwCurrentColorHex = s.hwColor;
      if (hwCurrentColorHex !== 'multi') hwColorPicker.value = hwCurrentColorHex;
    }
    
    if (s.customColors && Array.isArray(s.customColors)) {
      customColors = s.customColors;
      // Safety: Pad if layout changed or data is incomplete
      while (customColors.length < KEYBOARD_LAYOUT.length) {
        customColors.push({ r: 0, g: 0, b: 0 });
      }
    }
    if (s.paintColor) {
      paintColor = s.paintColor;
      customColorPicker.value = rgbToHex(paintColor.r, paintColor.g, paintColor.b);
    }
    if (s.customAutoPush !== undefined) {
      customAutoPush.checked = s.customAutoPush;
    }
    if (s.customBrightness) {
      customBrightSlider.value = s.customBrightness;
      customBrightVal.textContent = s.customBrightness;
    }
  } catch (e) {
    console.error('Failed to load settings', e);
  }
}

// ── Browser Support Check ─────────────────────────────────────────────────────
const modalOverlay = document.getElementById('browser-modal-overlay');
const modalClose   = document.getElementById('modal-close-btn');
const modalDontShow = document.getElementById('modal-dont-show');
const MODAL_PREF_KEY = 'mk1300_hide_browser_modal';

function checkBrowserSupport() {
  if (localStorage.getItem(MODAL_PREF_KEY) === 'true') return;
  modalOverlay.classList.add('active');
}

modalClose.addEventListener('click', () => {
  if (modalDontShow.checked) {
    localStorage.setItem(MODAL_PREF_KEY, 'true');
  }
  modalOverlay.classList.remove('active');
});

// ── Init ──────────────────────────────────────────────────────────────────────
loadSettings();
buildKeyboard();
buildCatTabs();
buildGrid();
switchTab(currentTab);
// Initial pattern/viz application (non-hardware)
if (currentTab === 'software') {
  applyPattern(currentPattern, false);
} else if (currentTab === 'custom') {
  refreshCustomKeyboard();
}
renderProfileList();
highlightActiveSwatch();
highlightHwSwatch();
log('READY. SELECT PATTERN & CONNECT.');


// ── UI Theme ──────────────────────────────────────────────────────────────────
const THEME_KEY = 'mk1300_ui_theme';
const themeSwatches = document.querySelectorAll('.theme-swatch');

function applyUITheme(themeId) {
  document.documentElement.setAttribute('data-ui-theme', themeId);
  themeSwatches.forEach(s => s.classList.toggle('active', s.dataset.theme === themeId));
  localStorage.setItem(THEME_KEY, themeId);
}

themeSwatches.forEach(swatch => {
  swatch.addEventListener('click', () => applyUITheme(swatch.dataset.theme));
});

// Init theme
const savedTheme = localStorage.getItem(THEME_KEY) || 'default';
applyUITheme(savedTheme);

// ── HW Revision Check Modal ───────────────────────────────────────────────────
const hwModalOverlay  = document.getElementById('hw-modal-overlay');
const hwModalClose    = document.getElementById('hw-modal-close-btn');
const hwModalDontShow = document.getElementById('hw-modal-dont-show');
const HW_MODAL_KEY    = 'mk1300_hide_hw_modal';

function checkHWRevision() {
  if (localStorage.getItem(HW_MODAL_KEY) === 'true') return;
  hwModalOverlay.classList.add('active');
}

hwModalClose.addEventListener('click', () => {
  if (hwModalDontShow.checked) {
    localStorage.setItem(HW_MODAL_KEY, 'true');
  }
  hwModalOverlay.classList.remove('active');
});

// Run checks on load — HW revision first, then browser compatibility
checkHWRevision();
checkBrowserSupport();



