import { HIDDriver } from './hid-driver.js';
import { KEYBOARD_LAYOUT, KEY_COUNT, KB_WIDTH, KB_HEIGHT } from './keyboard-layout.js';
import { PATTERNS } from './effects.js';
import { EXTRA_PATTERNS } from './extra-effects.js';

const ALL_PATTERNS = [...PATTERNS, ...EXTRA_PATTERNS];


const driver = new HIDDriver();
let currentPattern = ALL_PATTERNS[0];
let currentColors  = [];
let activeCat      = 'all';
let sendPending    = false;
let currentTab     = 'software';

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
        // mode 16 is Custom Mode (UserLight) 
        await driver.setHardwareAnimation(16, 4);
        log('OK: custom RGB mode active');
        await applyPattern(currentPattern, true);
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
      driver.setHardwareAnimation(16, 4).then(() => applyPattern(currentPattern, true));
    } else if (tab === 'hardware') {
      updateHardwareLight();
    } else if (tab === 'custom') {
      driver.setHardwareAnimation(16, 4).then(() => {
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
const customClear      = document.getElementById('custom-clear');
const customUndo       = document.getElementById('custom-undo');
const customPush       = document.getElementById('custom-push');
const customAutoPush   = document.getElementById('custom-autopush');
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

function refreshCustomKeyboard() {
  customKb.querySelectorAll('.custom-key').forEach(el => {
    const i = parseInt(el.dataset.idx);
    const c = customColors[i] || { r: 0, g: 0, b: 0 };
    el.style.backgroundColor = `rgb(${c.r},${c.g},${c.b})`;
    const bright = Math.max(c.r, c.g, c.b);
    el.style.boxShadow = bright > 20
      ? `0 0 ${Math.round(bright/14)}px rgba(${c.r},${c.g},${c.b},0.5)`
      : 'none';
  });
  // Also update sidebar preview
  applyViz(customColors);
}

async function pushCustomToHW() {
  if (!driver.connected) return;
  if (sendPending) return;
  sendPending = true;
  try {
    const flat = new Array(KEY_COUNT * 3).fill(0);
    KEYBOARD_LAYOUT.forEach((key, i) => {
      if (customColors[i]) {
        flat[key.index * 3]     = customColors[i].r;
        flat[key.index * 3 + 1] = customColors[i].g;
        flat[key.index * 3 + 2] = customColors[i].b;
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

// ── Action buttons ──────────────────────────────────────────────────────────
customFill.addEventListener('click', () => {
  saveUndoState();
  customColors = KEYBOARD_LAYOUT.map(() => ({ ...paintColor }));
  refreshCustomKeyboard();
  if (customAutoPush.checked) pushCustomToHW();
  saveSettings();
  log('Filled all keys');
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
    customAutoPush: customAutoPush.checked
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function loadSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return;
  try {
    const s = JSON.parse(raw);
    
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
    
    if (s.hwMode) hwMode.value = s.hwMode;
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

// Run check on load
checkBrowserSupport();

