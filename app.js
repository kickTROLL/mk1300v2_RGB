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
  if (!sendToHW || !driver.connected) return;
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
    log(`OK: "${p.name}" applied`);
  } catch(e) { log(`ERR: ${e.message}`); }
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
    card.addEventListener('click', () => applyPattern(p, true));
    patternsGrid.appendChild(card);
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
    try {
      await driver.setLightMode(6, 255);
      log('OK: custom RGB mode active');
    } catch(e) { log('WARN: ' + e.message); }
    await applyPattern(currentPattern, true);
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
bSlider.addEventListener('input', () => {
  bVal.textContent = bSlider.value;
  applyPattern(currentPattern, driver.connected);
});

// Sidebar resize
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

// ── Init ──────────────────────────────────────────────────────────────────────
buildKeyboard();
buildCatTabs();
buildGrid();
applyPattern(ALL_PATTERNS[0], false);
log('READY. SELECT PATTERN & CONNECT.');

