/**
 * 20 Static RGB Patterns for MK1300 V2 60%
 * Each pattern: (keys) => [{r,g,b}, ...] indexed by layout order
 * Coordinates normalised to KB_WIDTH=15, KB_HEIGHT=5
 */

import { KB_WIDTH, KB_HEIGHT } from './keyboard-layout.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

function hsl(h, s, l) {
  h = ((h % 360) + 360) % 360; s = Math.max(0, Math.min(1, s)); l = Math.max(0, Math.min(1, l));
  const c = (1 - Math.abs(2*l-1)) * s, x = c*(1-Math.abs((h/60)%2-1)), m = l-c/2;
  let r,g,b;
  if(h<60){r=c;g=x;b=0}else if(h<120){r=x;g=c;b=0}else if(h<180){r=0;g=c;b=x}
  else if(h<240){r=0;g=x;b=c}else if(h<300){r=x;g=0;b=c}else{r=c;g=0;b=x}
  return { r:Math.round((r+m)*255), g:Math.round((g+m)*255), b:Math.round((b+m)*255) };
}

function rgb(r,g,b){ return { r,g,b }; }
const OFF = rgb(0,0,0);

// Normalised key centre (0-1 range)
function nx(k){ return (k.x + k.w/2) / KB_WIDTH; }
function ny(k){ return (k.y + k.h/2) / KB_HEIGHT; }

// Linear gradient left→right by hue range
function hGrad(keys, h1, h2, s=1, l=0.5){
  return keys.map(k => hsl(h1 + (h2-h1)*nx(k), s, l));
}
// Vertical gradient top→bottom
function vGrad(keys, h1, h2, s=1, l=0.5){
  return keys.map(k => hsl(h1 + (h2-h1)*ny(k), s, l));
}

// Row of a key (0-4)
function row(k){ return Math.round(k.y); }

// Classify key zone
function zone(k){
  const n = k.name;
  if(['Esc','Tab','Caps','Shift','Ctrl','Win','Alt','Menu','Fn','←','Enter','Space'].includes(n)) return 'mod';
  if(['1','2','3','4','5','6','7','8','9','0','-','='].includes(n)) return 'num';
  return 'alpha';
}

// WASD/gaming key set
const WASD = new Set([44,45,46,47,64,65,66,67,68,69]); // W,E,R,A,S,D,F,G+surround... actually WASD = W(44),A(64),S(65),D(66)

// ── Patterns ─────────────────────────────────────────────────────────────────

// 1. Sunset Dusk — warm horizontal gradient: crimson → amber → gold
function sunsetDusk(keys){
  return keys.map(k => {
    const t = nx(k);
    const h = 0 + t*50;        // 0°(red) → 50°(amber-gold)
    const s = 1, l = 0.48;
    return hsl(h, s, l);
  });
}

// 2. Northern Lights — cool vertical: deep indigo top → vivid teal bottom
function northernLights(keys){
  return keys.map(k => {
    const t = ny(k);
    const h = 260 - t*80;      // 260°(indigo) → 180°(teal)
    return hsl(h, 1, 0.45 + t*0.05);
  });
}

// 3. Cyberpunk — magenta modifiers, electric cyan alpha, yellow numbers
function cyberpunk(keys){
  return keys.map(k => {
    const z = zone(k);
    if(z === 'mod') return hsl(300, 1, 0.50);   // hot pink/magenta
    if(z === 'num') return hsl(55,  1, 0.50);   // electric yellow
    return hsl(186, 1, 0.50);                    // neon cyan
  });
}

// 4. Ocean Deep — dark navy bottom rows → bright aqua top
function oceanDeep(keys){
  return keys.map(k => {
    const t = 1 - ny(k);       // 0=bottom, 1=top
    const h = 200 + t*20;
    const l = 0.12 + t*0.42;
    return hsl(h, 1, l);
  });
}

// 5. Rose Gold — horizontal: deep rose left → warm champagne right
function roseGold(keys){
  return keys.map(k => {
    const t = nx(k);
    const h = 340 - t*20;     // 340°(rose) → 320°(pink-gold)
    const l = 0.44 + t*0.08;
    return hsl(h, 0.80, l);
  });
}

// 6. Dracula — purple base, pink accents on modifiers, green on Enter/Esc
function dracula(keys){
  return keys.map(k => {
    if(['Enter'].includes(k.name)) return hsl(135, 1, 0.45);  // green
    if(['Esc'].includes(k.name))   return hsl(135, 1, 0.45);
    if(zone(k)==='mod')            return hsl(326, 1, 0.62);  // pink
    const t = nx(k);
    return hsl(265 + t*15, 0.60, 0.38);                       // deep purple body
  });
}

// 7. Arctic Ice — cold white-blue: almost white centre, ice blue edges
function arcticIce(keys){
  return keys.map(k => {
    const cx = Math.abs(nx(k)-0.5)*2;  // 0=centre, 1=edges
    const h = 200;
    const l = 0.85 - cx*0.40;
    const s = 0.30 + cx*0.70;
    return hsl(h, s, l);
  });
}

// 8. Ember — deep red typing keys, orange-amber modifiers
function ember(keys){
  return keys.map(k => {
    if(zone(k)==='mod') return hsl(30, 1, 0.50);   // orange
    const t = nx(k);
    return hsl(0 + t*15, 0.95, 0.40);              // crimson → dark red
  });
}

// 9. Matrix Green — all keys in bright/dark greens by column
function matrixGreen(keys){
  return keys.map(k => {
    const t = nx(k);
    const l = 0.25 + Math.abs(Math.sin(t*12))*0.30;
    return hsl(120 + t*20, 1, l);
  });
}

// 10. Pastel Rainbow — column-by-column soft hue steps
function pastelRainbow(keys){
  return keys.map(k => {
    const h = (nx(k) * 300) % 360;
    return hsl(h, 0.70, 0.68);
  });
}

// 11. Royal Amethyst — rich violet body, gold on modifiers
function royalAmethyst(keys){
  return keys.map(k => {
    if(zone(k)==='mod') return hsl(45, 1, 0.52);      // gold
    const t = nx(k);
    return hsl(270 - t*20, 0.75, 0.40);               // violet
  });
}

// 12. Monochrome Silver — pure white with subtle blue tint edges
function monochromesilver(keys){
  return keys.map(k => {
    const t = ny(k);
    const l = 0.90 - t*0.35;
    return hsl(210, 0.15, l);
  });
}

// 13. WASD Gaming — WASD bright cyan, surrounds dim, rest very dark
const WASD_IDX = new Set([44,64,65,66]);
function wasdGaming(keys){
  return keys.map(k => {
    if(WASD_IDX.has(k.index)) return hsl(186, 1, 0.55);  // bright teal
    if(['Space'].includes(k.name)) return hsl(186, 0.6, 0.30);
    const t = ny(k);
    return hsl(220, 0.50, 0.08 + t*0.05);               // near-black
  });
}

// 14. Cherry Blossom — soft pinks and warm whites
function cherryBlossom(keys){
  return keys.map(k => {
    const t = nx(k);
    const h = 340 + Math.sin(t*Math.PI)*10;
    const l = 0.70 + Math.cos(ny(k)*Math.PI*0.5)*0.10;
    return hsl(h, 0.75, l);
  });
}

// 15. Neon Noir — everything off except a few neon accent keys
const NOIR_ACCENTS = new Set([21,34,76,84,97,111]); // Esc,Bksp,Enter,LShift,RShift,Space
function neonNoir(keys){
  return keys.map(k => {
    if(NOIR_ACCENTS.has(k.index)) return hsl(300, 1, 0.55); // neon pink
    if(zone(k)==='alpha') return hsl(220, 0.40, 0.08);       // very dim blue
    return OFF;
  });
}

// 16. Blood Moon — deep crimson top fading to charcoal bottom
function bloodMoon(keys){
  return keys.map(k => {
    const t = ny(k);                 // 0=top, 1=bottom
    const h = 5 - t*5;
    const l = 0.48 - t*0.36;
    return hsl(h, 1, Math.max(0.04, l));
  });
}

// 17. Vaporwave — diagonal pink-to-purple gradient
function vaporwave(keys){
  return keys.map(k => {
    const d = nx(k)*0.5 + ny(k)*0.5;  // diagonal 0-1
    const h = 310 - d*60;              // 310°(pink) → 250°(purple)
    return hsl(h, 0.85, 0.55);
  });
}

// 18. Forest Depth — rich greens: lime top, deep forest bottom
function forestDepth(keys){
  return keys.map(k => {
    const t = ny(k);
    const h = 95 - t*20;              // 95°(lime) → 75°(yellow-green)
    const l = 0.48 - t*0.22;
    return hsl(h, 0.80, Math.max(0.15, l));
  });
}

// 19. Home Row Hero — ASDF JKL; lit in warm gold, rest in very dim cool
const HOMEROW = new Set([64,65,66,67,68,69,70,71,72,73]); // A S D F G H J K L ;
function homeRowHero(keys){
  return keys.map(k => {
    if(HOMEROW.has(k.index)) return hsl(45, 1, 0.55);      // warm gold
    if(k.index === 111) return hsl(45, 0.5, 0.20);          // dim space
    return hsl(220, 0.30, 0.06);                             // near-black body
  });
}

// 20. Synthwave — deep pink bottom rows, electric blue top, purple middle
function synthwave(keys){
  return keys.map(k => {
    const t = ny(k);  // 0=top, 1=bottom
    let h;
    if(t < 0.3)      h = 200;                 // electric blue (top)
    else if(t < 0.6) h = 270;                 // purple (middle)
    else             h = 330;                 // deep pink (bottom)
    const l = 0.42 + (1-t)*0.08;
    return hsl(h, 1, l);
  });
}


// ── 30 More Patterns ──────────────────────────────────────────────────────────

// 21. Galaxy — deep space: scattered bright whites on near-black purple base
function galaxy(keys){
  return keys.map((k,i) => {
    const star = Math.abs(Math.sin(i*127.1 + k.index*73.5)) > 0.82;
    if(star) return hsl(220, 0.20, 0.92);          // star-white
    const t = nx(k)*0.4 + ny(k)*0.6;
    return hsl(260 + t*30, 0.55, 0.08 + t*0.06);  // deep cosmic purple
  });
}

// 22. Lava — volcanic orange/red with dark charcoal gaps
function lava(keys){
  return keys.map(k => {
    const wave = Math.sin(nx(k)*8) * 0.5 + Math.cos(ny(k)*5) * 0.5;
    const t = (wave + 1) / 2;
    const h = t * 35;                // 0°(red) → 35°(orange)
    const l = 0.15 + t * 0.38;
    return hsl(h, 1, l);
  });
}

// 23. Peacock — vivid teal-green body, iridescent blue modifiers
function peacock(keys){
  return keys.map(k => {
    if(zone(k)==='mod') return hsl(220, 1, 0.50);   // deep cobalt blue
    const t = nx(k);
    return hsl(165 + t*25, 1, 0.38 + t*0.08);       // teal → cyan
  });
}

// 24. Toxic — acid green/yellow glow, near-black base
function toxic(keys){
  return keys.map(k => {
    const t = nx(k);
    const l = 0.30 + Math.abs(Math.sin(t*6 + ny(k)*4)) * 0.22;
    return hsl(80 + t*20, 1, l);
  });
}

// 25. Cotton Candy — alternating pastel pink and sky blue by column
function cottonCandy(keys){
  return keys.map(k => {
    const col = Math.floor(k.x + k.w/2);
    return col % 2 === 0 ? hsl(340, 0.80, 0.75) : hsl(200, 0.70, 0.72);
  });
}

// 26. Deep Space — near-black base with electric cyan on select keys
const SPACE_ACCENTS = new Set([21,76,111,84,97]); // Esc, Enter, Space, Shifts
function deepSpace(keys){
  return keys.map(k => {
    if(SPACE_ACCENTS.has(k.index)) return hsl(190, 1, 0.55);
    const t = nx(k)*0.3 + ny(k)*0.7;
    return hsl(230 + t*20, 0.60, 0.04 + t*0.07);
  });
}

// 27. Infrared — thermal imaging: hot white center, red edges, black outside
function infrared(keys){
  return keys.map(k => {
    const cx = 1 - Math.abs(nx(k)-0.5)*2;  // 1=centre, 0=edges
    const cy = 1 - Math.abs(ny(k)-0.5)*2;
    const heat = (cx + cy) / 2;
    if(heat > 0.75) return hsl(60, 1, 0.90);   // white-hot
    if(heat > 0.50) return hsl(30, 1, 0.55);   // orange
    return hsl(0, 1, heat * 0.50);             // red → black
  });
}

// 28. Electric Storm — dark base, bright lightning-yellow on specific keys
const LIGHTNING = new Set([21,22,34,42,63,84,97,111,76]);
function electricStorm(keys){
  return keys.map(k => {
    if(LIGHTNING.has(k.index)) return hsl(55, 1, 0.70);  // electric yellow
    if(zone(k)==='alpha') return hsl(240, 0.40, 0.07);
    return hsl(240, 0.30, 0.04);
  });
}

// 29. Jade — rich jade green gradient with lighter centre column
function jade(keys){
  return keys.map(k => {
    const cx = Math.abs(nx(k)-0.5)*2;
    const l = 0.32 + (1-cx)*0.15;
    return hsl(150 + cx*10, 0.70, l);
  });
}

// 30. Copper Circuit — warm copper/bronze tones across keys
function copperCircuit(keys){
  return keys.map(k => {
    const t = nx(k);
    const h = 20 + t*15;            // warm copper range
    const l = 0.35 + ny(k)*0.10;
    return hsl(h, 0.70, l);
  });
}

// 31. Holographic — rapid diagonal hue sweep, rich saturation
function holographic(keys){
  return keys.map(k => {
    const d = nx(k)*0.6 + ny(k)*0.4;
    const h = (d * 360) % 360;
    return hsl(h, 1, 0.52);
  });
}

// 32. Ultraviolet — deep purple base, UV neon on modifier keys
function ultraviolet(keys){
  return keys.map(k => {
    if(zone(k)==='mod') return hsl(290, 1, 0.62);   // bright UV purple
    const t = nx(k);
    return hsl(270 + t*10, 0.80, 0.22);             // deep indigo body
  });
}

// 33. Caribbean — turquoise left → warm coral right
function caribbean(keys){
  return keys.map(k => {
    const t = nx(k);
    const h = 180 - t*160;          // 180°(teal) → 20°(coral)
    const l = 0.50 - Math.abs(t-0.5)*0.05;
    return hsl(h, 0.90, l);
  });
}

// 34. Neon Sign — each row a different vivid neon color
function neonSign(keys){
  const rowColors = [
    hsl(55,  1, 0.55),   // row 0: yellow
    hsl(120, 1, 0.48),   // row 1: green
    hsl(186, 1, 0.52),   // row 2: cyan
    hsl(300, 1, 0.52),   // row 3: magenta
    hsl(15,  1, 0.55),   // row 4: orange-red
  ];
  return keys.map(k => rowColors[Math.round(k.y)] || rowColors[0]);
}

// 35. Obsidian — near-black with very subtle dark red shimmer
function obsidian(keys){
  return keys.map(k => {
    const t = nx(k);
    const l = 0.06 + Math.abs(Math.sin(t*9 + ny(k)*5)) * 0.08;
    return hsl(10, 0.70, l);
  });
}

// 36. Golden Hour — warm yellow-orange horizontal gradient
function goldenHour(keys){
  return keys.map(k => {
    const t = nx(k);
    const h = 50 - t*30;      // 50°(golden) → 20°(amber)
    return hsl(h, 1, 0.50 - t*0.05);
  });
}

// 37. Winter Frost — very pale ice blue, brighter at top
function winterFrost(keys){
  return keys.map(k => {
    const t = ny(k);
    const l = 0.88 - t*0.30;
    return hsl(205, 0.55, l);
  });
}

// 38. Aurora — vertical bands of green and magenta
function aurora(keys){
  return keys.map(k => {
    const wave = Math.sin(nx(k)*Math.PI*3) * 0.5 + 0.5;
    const h = 140 + wave*140;        // 140°(green) → 280°(purple)
    const l = 0.38 + wave*0.12;
    return hsl(h, 1, l);
  });
}

// 39. Warm Hearth — amber/gold radiating from centre outward
function warmHearth(keys){
  return keys.map(k => {
    const cx = Math.abs(nx(k)-0.5)*2;
    const cy = Math.abs(ny(k)-0.5)*2;
    const dist = Math.sqrt(cx*cx + cy*cy) / Math.sqrt(2);
    const h = 45 - dist*30;
    const l = 0.60 - dist*0.42;
    return hsl(h, 1, Math.max(0.05, l));
  });
}

// 40. Deep Teal — very dark teal with slight brightness variation by row
function deepTeal(keys){
  return keys.map(k => {
    const t = ny(k);
    return hsl(185, 1, 0.14 + (1-t)*0.18);
  });
}

// 41. Hot Pink — all keys in varying shades of vivid pink
function hotPink(keys){
  return keys.map(k => {
    const t = nx(k)*0.5 + ny(k)*0.5;
    return hsl(320 + t*20, 1, 0.50 - t*0.10);
  });
}

// 42. Lime Punch — bright lime modifiers, dark olive typing
function limePunch(keys){
  return keys.map(k => {
    if(zone(k)==='mod') return hsl(80, 1, 0.52);
    if(zone(k)==='num') return hsl(95, 0.90, 0.42);
    return hsl(100, 0.55, 0.22);
  });
}

// 43. Midnight Sakura — dark bg, soft pink glow on alpha keys only
function midnightSakura(keys){
  return keys.map(k => {
    if(zone(k)==='alpha') return hsl(340, 0.75, 0.55);
    if(zone(k)==='num')   return hsl(340, 0.40, 0.25);
    return hsl(270, 0.30, 0.06);
  });
}

// 44. Titanium — cool grey-blue metallic look
function titanium(keys){
  return keys.map(k => {
    const t = nx(k)*0.4 + ny(k)*0.6;
    return hsl(215, 0.20, 0.55 - t*0.20);
  });
}

// 45. Molten Gold — rich deep gold fading into bronze at edges
function moltenGold(keys){
  return keys.map(k => {
    const t = nx(k);
    const cy = Math.abs(ny(k)-0.5)*2;
    const h = 44 - cy*15;
    const l = 0.52 - cy*0.22;
    return hsl(h, 1, Math.max(0.15, l));
  });
}

// 46. Coral Reef — warm coral top, deep blue bottom
function coralReef(keys){
  return keys.map(k => {
    const t = ny(k);
    const h = 15 + t*190;       // 15°(coral) → 205°(deep blue)
    const l = 0.55 - t*0.25;
    return hsl(h, 0.90, Math.max(0.15, l));
  });
}

// 47. Candy Stripes — alternating warm and cool stripes by key column
function candyStripes(keys){
  return keys.map(k => {
    const col = Math.floor(k.x + k.w/2);
    const stripe = col % 3;
    if(stripe === 0) return hsl(0,   0.90, 0.55);  // red
    if(stripe === 1) return hsl(210, 0.80, 0.60);  // blue
    return hsl(0, 0, 0.90);                         // white
  });
}

// 48. Frozen Ocean — deep navy to bright icy white, horizontal
function frozenOcean(keys){
  return keys.map(k => {
    const t = nx(k);
    const h = 210;
    const l = 0.15 + t*0.70;
    const s = 0.80 - t*0.50;
    return hsl(h, s, l);
  });
}

// 49. Volcanic Ash — dark grey-brown base with glowing orange cracks (modifiers)
function volcanicAsh(keys){
  return keys.map(k => {
    if(zone(k)==='mod') return hsl(25, 1, 0.48);     // lava orange
    const t = nx(k)*ny(k);
    return hsl(20, 0.15, 0.12 + t*0.08);             // ash grey
  });
}

// 50. Retrograde — right-to-left reverse rainbow, pastel wash
function retrograde(keys){
  return keys.map(k => {
    const t = 1 - nx(k);         // reversed: right=0, left=1
    const h = t * 270;           // 0°(red) → 270°(violet) reversed
    return hsl(h, 0.65, 0.62);
  });
}

// ── Registry ─────────────────────────────────────────────────────────────────

export const PATTERNS = [
  // Original 20
  { id:'sunset',       name:'Sunset Dusk',      icon:'🌅', fn: sunsetDusk },
  { id:'northern',     name:'Northern Lights',  icon:'🌌', fn: northernLights },
  { id:'cyberpunk',    name:'Cyberpunk',         icon:'⚡', fn: cyberpunk },
  { id:'ocean',        name:'Ocean Deep',        icon:'🌊', fn: oceanDeep },
  { id:'rosegold',     name:'Rose Gold',         icon:'🌸', fn: roseGold },
  { id:'dracula',      name:'Dracula',           icon:'🧛', fn: dracula },
  { id:'arctic',       name:'Arctic Ice',        icon:'❄️', fn: arcticIce },
  { id:'ember',        name:'Ember',             icon:'🔥', fn: ember },
  { id:'matrix',       name:'Matrix Green',      icon:'💚', fn: matrixGreen },
  { id:'pastel',       name:'Pastel Rainbow',    icon:'🎨', fn: pastelRainbow },
  { id:'amethyst',     name:'Royal Amethyst',    icon:'💜', fn: royalAmethyst },
  { id:'silver',       name:'Monochrome Silver', icon:'⚪', fn: monochromesilver },
  { id:'wasd',         name:'WASD Gaming',       icon:'🎮', fn: wasdGaming },
  { id:'cherry',       name:'Cherry Blossom',    icon:'🌺', fn: cherryBlossom },
  { id:'noir',         name:'Neon Noir',         icon:'🖤', fn: neonNoir },
  { id:'blood',        name:'Blood Moon',        icon:'🌑', fn: bloodMoon },
  { id:'vaporwave',    name:'Vaporwave',         icon:'🌈', fn: vaporwave },
  { id:'forest',       name:'Forest Depth',      icon:'🌿', fn: forestDepth },
  { id:'homerow',      name:'Home Row Hero',     icon:'🏠', fn: homeRowHero },
  { id:'synthwave',    name:'Synthwave',         icon:'🎹', fn: synthwave },
  // New 30
  { id:'galaxy',       name:'Galaxy',            icon:'🌠', fn: galaxy },
  { id:'lava',         name:'Lava',              icon:'🌋', fn: lava },
  { id:'peacock',      name:'Peacock',           icon:'🦚', fn: peacock },
  { id:'toxic',        name:'Toxic',             icon:'☢️', fn: toxic },
  { id:'cotton',       name:'Cotton Candy',      icon:'🍬', fn: cottonCandy },
  { id:'deepspace',    name:'Deep Space',        icon:'🛸', fn: deepSpace },
  { id:'infrared',     name:'Infrared',          icon:'🌡️', fn: infrared },
  { id:'storm',        name:'Electric Storm',    icon:'🌩️', fn: electricStorm },
  { id:'jade',         name:'Jade',              icon:'🪨', fn: jade },
  { id:'copper',       name:'Copper Circuit',    icon:'🔧', fn: copperCircuit },
  { id:'holo',         name:'Holographic',       icon:'💿', fn: holographic },
  { id:'uv',           name:'Ultraviolet',       icon:'🔮', fn: ultraviolet },
  { id:'caribbean',    name:'Caribbean',         icon:'🏖️', fn: caribbean },
  { id:'neonsign',     name:'Neon Sign',         icon:'💡', fn: neonSign },
  { id:'obsidian',     name:'Obsidian',          icon:'🖤', fn: obsidian },
  { id:'golden',       name:'Golden Hour',       icon:'🌻', fn: goldenHour },
  { id:'frost',        name:'Winter Frost',      icon:'🧊', fn: winterFrost },
  { id:'aurora',       name:'Aurora',            icon:'🎇', fn: aurora },
  { id:'hearth',       name:'Warm Hearth',       icon:'🕯️', fn: warmHearth },
  { id:'deepteal',     name:'Deep Teal',         icon:'🌿', fn: deepTeal },
  { id:'hotpink',      name:'Hot Pink',          icon:'💗', fn: hotPink },
  { id:'lime',         name:'Lime Punch',        icon:'🍏', fn: limePunch },
  { id:'sakura',       name:'Midnight Sakura',   icon:'🌙', fn: midnightSakura },
  { id:'titanium',     name:'Titanium',          icon:'🔩', fn: titanium },
  { id:'moltengold',   name:'Molten Gold',       icon:'🏆', fn: moltenGold },
  { id:'coral',        name:'Coral Reef',        icon:'🪸', fn: coralReef },
  { id:'candy',        name:'Candy Stripes',     icon:'🍭', fn: candyStripes },
  { id:'frozen',       name:'Frozen Ocean',      icon:'🌊', fn: frozenOcean },
  { id:'volcanic',     name:'Volcanic Ash',      icon:'💨', fn: volcanicAsh },
  { id:'retrograde',   name:'Retrograde',        icon:'🔄', fn: retrograde },

  // ── 10 Infrared-style radial heat maps ──────────────────────────────────────
  { id:'ir_left',      name:'Heat Source Left',  icon:'🌡', fn: irLeft },
  { id:'ir_cold',      name:'Cryo Core',         icon:'🥶', fn: cryoCore },
  { id:'ir_teal',      name:'Thermal Teal',      icon:'🌿', fn: thermalTeal },
  { id:'ir_dual',      name:'Dual Heat',         icon:'♨️', fn: dualHeat },
  { id:'ir_vert',      name:'Vertical Burn',     icon:'🔆', fn: verticalBurn },
  { id:'ir_solar',     name:'Solar Core',        icon:'☀️', fn: solarCore },
  { id:'ir_plasma',    name:'Plasma Radial',     icon:'⚛️', fn: plasmaRadial },
  { id:'ir_corner',    name:'Corner Blaze',      icon:'🔱', fn: cornerBlaze },
  { id:'ir_coldwave',  name:'Cold Wave',         icon:'🌊', fn: coldWave },
  { id:'ir_atomic',    name:'Atomic Glow',       icon:'☢️', fn: atomicGlow },

  // ── 30 More patterns ────────────────────────────────────────────────────────
  { id:'trizone',      name:'Tri-Zone',          icon:'🎯', fn: triZone },
  { id:'flamtips',     name:'Flame Tips',        icon:'🕯', fn: flameTips },
  { id:'nordic',       name:'Nordic',            icon:'🏔️', fn: nordic },
  { id:'peachfuzz',    name:'Peach Fuzz',        icon:'🍑', fn: peachFuzz },
  { id:'radioact',     name:'Radioactive',       icon:'☣️', fn: radioactive },
  { id:'spectral',     name:'Spectral',          icon:'🌈', fn: spectral },
  { id:'denim',        name:'Denim Blue',        icon:'👖', fn: denimBlue },
  { id:'bronzeage',    name:'Bronze Age',        icon:'🏺', fn: bronzeAge },
  { id:'purplehaze',   name:'Purple Haze',       icon:'💜', fn: purpleHaze },
  { id:'nightsky2',    name:'Night Sky',         icon:'🌃', fn: nightSky },
  { id:'highcontrast', name:'High Contrast',     icon:'⬛', fn: highContrast },
  { id:'blueprint',    name:'Blueprint',         icon:'📐', fn: blueprint },
  { id:'mintfresh',    name:'Mint Fresh',        icon:'🌱', fn: mintFresh },
  { id:'cyberdeck',    name:'Cyberdeck',         icon:'🖥️', fn: cyberdeck },
  { id:'deepwine',     name:'Deep Wine',         icon:'🍷', fn: deepWine },
  { id:'coppergold',   name:'Copper & Gold',     icon:'🪙', fn: copperGold },
  { id:'seafoam',      name:'Seafoam',           icon:'🫧', fn: seafoam },
  { id:'orchid',       name:'Orchid',            icon:'🌷', fn: orchid },
  { id:'neonblue',     name:'Neon Blue',         icon:'💙', fn: neonBlue },
  { id:'sandstone',    name:'Sandstone',         icon:'🏜️', fn: sandstone },
  { id:'lavender',     name:'Lavender',          icon:'💐', fn: lavender },
  { id:'candyapple',   name:'Candy Apple',       icon:'🍎', fn: candyApple },
  { id:'aquadream',    name:'Aqua Dream',        icon:'💎', fn: aquaDream },
  { id:'solarized',    name:'Solarized',         icon:'🌤️', fn: solarized },
  { id:'magmachamber', name:'Magma Chamber',     icon:'🌋', fn: magmaChamber },
  { id:'carbon',       name:'Carbon Fiber',      icon:'🖤', fn: carbonFiber },
  { id:'sundown',      name:'Sundown',           icon:'🌇', fn: sundown },
  { id:'neonmint',     name:'Neon Mint',         icon:'🍃', fn: neonMint },
  { id:'deepindigo',   name:'Deep Indigo',       icon:'🌀', fn: deepIndigo },
  { id:'stormcloud',   name:'Storm Cloud',       icon:'⛈️', fn: stormCloud },
];


// ── 10 Infrared-style patterns ────────────────────────────────────────────────

// Helper: map a 0-1 heat value to a colour on a given scale
function heatColor(heat, scale) {
  heat = Math.max(0, Math.min(1, heat));
  if (scale === 'ir') {
    // Classic infrared: black → red → orange → yellow → white
    if (heat < 0.25) return hsl(0,   1, heat * 2);
    if (heat < 0.55) return hsl(0 + (heat-0.25)*100, 1, 0.50);
    if (heat < 0.80) return hsl(30 + (heat-0.55)*120, 1, 0.55);
    return hsl(60, 1, 0.55 + (heat-0.80)*2.25);  // → white-yellow
  }
  if (scale === 'cryo') {
    // Cryo: black → deep blue → cyan → white
    if (heat < 0.30) return hsl(240, 1, heat * 1.5);
    if (heat < 0.65) return hsl(200, 1, 0.35 + (heat-0.30)*0.6);
    return hsl(200, 0.30 - (heat-0.65)*0.9, 0.75 + (heat-0.65)*0.7);
  }
  if (scale === 'teal') {
    // Teal thermal: black → teal → green → white
    if (heat < 0.35) return hsl(170, 1, heat * 1.4);
    if (heat < 0.70) return hsl(140, 1, 0.38 + (heat-0.35)*0.5);
    return hsl(100, 0.6, 0.62 + (heat-0.70)*1.2);
  }
  if (scale === 'plasma') {
    // Plasma: black → violet → magenta → white
    if (heat < 0.30) return hsl(270, 1, heat * 1.6);
    if (heat < 0.65) return hsl(300, 1, 0.38 + (heat-0.30)*0.5);
    return hsl(320, 0.40, 0.62 + (heat-0.65)*1.1);
  }
  return hsl(0, 0, heat); // fallback: greyscale
}

// IR Left — heat source from left edge
function irLeft(keys) {
  return keys.map(k => heatColor(1 - nx(k), 'ir'));
}

// Cryo Core — ice-cold centre, warm edges
function cryoCore(keys) {
  return keys.map(k => {
    const cx = Math.abs(nx(k)-0.5)*2;
    const cy = Math.abs(ny(k)-0.5)*2;
    const heat = Math.sqrt(cx*cx + cy*cy) / Math.sqrt(2);
    return heatColor(heat * 0.9, 'cryo');
  });
}

// Thermal Teal — teal heat map from centre
function thermalTeal(keys) {
  return keys.map(k => {
    const cx = 1 - Math.abs(nx(k)-0.5)*2;
    const cy = 1 - Math.abs(ny(k)-0.5)*2;
    return heatColor((cx+cy)/2, 'teal');
  });
}

// Dual Heat — two hot sources: top-left and bottom-right corners
function dualHeat(keys) {
  return keys.map(k => {
    const d1 = Math.sqrt(nx(k)**2 + ny(k)**2) / Math.sqrt(2);       // dist from TL
    const d2 = Math.sqrt((1-nx(k))**2 + (1-ny(k))**2) / Math.sqrt(2); // dist from BR
    const heat = 1 - Math.min(d1, d2);
    return heatColor(heat * 0.95, 'ir');
  });
}

// Vertical Burn — heat from top, cold at bottom
function verticalBurn(keys) {
  return keys.map(k => heatColor(1 - ny(k), 'ir'));
}

// Solar Core — extremely bright white centre, deep red/black at edges
function solarCore(keys) {
  return keys.map(k => {
    const cx = 1 - Math.abs(nx(k)-0.5)*2;
    const cy = 1 - Math.abs(ny(k)-0.5)*2;
    const heat = Math.pow((cx+cy)/2, 0.6); // sharper falloff
    return heatColor(heat, 'ir');
  });
}

// Plasma Radial — violet/magenta heat map from centre
function plasmaRadial(keys) {
  return keys.map(k => {
    const cx = 1 - Math.abs(nx(k)-0.5)*2;
    const cy = 1 - Math.abs(ny(k)-0.5)*2;
    return heatColor((cx+cy)/2 * 0.98, 'plasma');
  });
}

// Corner Blaze — heat from top-left corner, cold bottom-right
function cornerBlaze(keys) {
  return keys.map(k => {
    const d = Math.sqrt(nx(k)**2 + ny(k)**2) / Math.sqrt(2);
    return heatColor(1 - d, 'ir');
  });
}

// Cold Wave — cold (cryo) wave from right side
function coldWave(keys) {
  return keys.map(k => heatColor(nx(k), 'cryo'));
}

// Atomic Glow — bright radioactive green radial from centre
function atomicGlow(keys) {
  return keys.map(k => {
    const cx = 1 - Math.abs(nx(k)-0.5)*2;
    const cy = 1 - Math.abs(ny(k)-0.5)*2;
    return heatColor((cx+cy)/2, 'teal');
  });
}

// ── 30 more patterns ─────────────────────────────────────────────────────────

// Tri-Zone — 3 equal horizontal colour zones
function triZone(keys) {
  return keys.map(k => {
    const t = nx(k);
    if (t < 0.33) return hsl(200, 1, 0.50);   // left: cyan
    if (t < 0.66) return hsl(270, 1, 0.50);   // mid: purple
    return hsl(340, 1, 0.52);                  // right: pink
  });
}

// Flame Tips — bottom rows bright orange, top rows dim charcoal
function flameTips(keys) {
  return keys.map(k => {
    const t = ny(k);            // 0=top, 1=bottom
    const h = 20 + t*15;
    const l = 0.08 + t*0.45;
    return hsl(h, 1, l);
  });
}

// Nordic — dark navy body, warm gold on modifiers
function nordic(keys) {
  return keys.map(k => {
    if (zone(k)==='mod') return hsl(42, 0.90, 0.50);
    return hsl(210, 0.60, 0.15 + ny(k)*0.08);
  });
}

// Peach Fuzz — warm, soft peach-orange all keys
function peachFuzz(keys) {
  return keys.map(k => {
    const t = nx(k)*0.3 + ny(k)*0.7;
    return hsl(22 + t*10, 0.85, 0.62 - t*0.10);
  });
}

// Radioactive — neon green radial glow, black edges
function radioactive(keys) {
  return keys.map(k => {
    const cx = 1 - Math.abs(nx(k)-0.5)*2;
    const cy = 1 - Math.abs(ny(k)-0.5)*2;
    const heat = (cx+cy)/2;
    return hsl(100 + heat*20, 1, 0.04 + heat*0.50);
  });
}

// Spectral — every key gets a unique hue across full 360° spectrum
function spectral(keys) {
  const n = keys.length;
  return keys.map((k, i) => hsl((i/n)*360, 0.90, 0.50));
}

// Denim Blue — deep cool blue, lighter at top
function denimBlue(keys) {
  return keys.map(k => {
    const t = ny(k);
    return hsl(215, 0.65, 0.32 - t*0.12);
  });
}

// Bronze Age — warm earthy bronze-brown tones
function bronzeAge(keys) {
  return keys.map(k => {
    const t = nx(k)*0.5 + ny(k)*0.5;
    return hsl(30 + t*10, 0.65, 0.30 + t*0.12);
  });
}

// Purple Haze — horizontal misty purple gradient
function purpleHaze(keys) {
  return keys.map(k => {
    const t = nx(k);
    return hsl(280 - t*30, 0.70, 0.40 + t*0.08);
  });
}

// Night Sky — near-black with a handful of bright-star keys
function nightSky(keys) {
  const STARS = new Set([22,29,45,50,65,71,88,92,106]);
  return keys.map(k => {
    if (STARS.has(k.index)) return hsl(220, 0.15, 0.92);
    return hsl(240, 0.40, 0.04 + ny(k)*0.03);
  });
}

// High Contrast — alternating rows full-on white and deep navy
function highContrast(keys) {
  return keys.map(k => {
    const r = Math.round(k.y);
    return r % 2 === 0 ? hsl(210, 0.10, 0.92) : hsl(225, 0.60, 0.14);
  });
}

// Blueprint — dark navy body, bright pure-blue on modifiers
function blueprint(keys) {
  return keys.map(k => {
    if (zone(k)==='mod') return hsl(210, 1, 0.60);
    return hsl(220, 0.80, 0.12);
  });
}

// Mint Fresh — cool mint green at top, clean white at bottom
function mintFresh(keys) {
  return keys.map(k => {
    const t = ny(k);
    const h = 155;
    const l = 0.52 + t*0.32;
    const s = 0.75 - t*0.55;
    return hsl(h, s, l);
  });
}

// Cyberdeck — dark teal body, cyan number row, orange bottom row
function cyberdeck(keys) {
  return keys.map(k => {
    const r = Math.round(k.y);
    if (r === 0) return hsl(186, 1, 0.55);   // cyan top
    if (r === 4) return hsl(25,  1, 0.52);   // orange bottom
    return hsl(185, 0.65, 0.18 + r*0.02);   // dark teal body
  });
}

// Deep Wine — dark burgundy-wine
function deepWine(keys) {
  return keys.map(k => {
    const t = nx(k)*0.4 + ny(k)*0.6;
    return hsl(340, 0.75, 0.22 + t*0.08);
  });
}

// Copper & Gold — alternating copper and gold columns
function copperGold(keys) {
  return keys.map(k => {
    const col = Math.floor(k.x + k.w/2);
    return col % 2 === 0 ? hsl(30, 0.80, 0.42) : hsl(48, 0.90, 0.52);
  });
}

// Seafoam — soft turquoise-green, lighter at top
function seafoam(keys) {
  return keys.map(k => {
    const t = ny(k);
    return hsl(168, 0.70, 0.62 - t*0.20);
  });
}

// Orchid — soft orchid/mauve purple all keys
function orchid(keys) {
  return keys.map(k => {
    const t = nx(k);
    return hsl(300 + t*15, 0.55, 0.50 + t*0.06);
  });
}

// Neon Blue — electric neon blue, brighter on top row
function neonBlue(keys) {
  return keys.map(k => {
    const t = ny(k);
    return hsl(210, 1, 0.58 - t*0.20);
  });
}

// Sandstone — warm beige/sand tones
function sandstone(keys) {
  return keys.map(k => {
    const t = ny(k);
    return hsl(38 + t*8, 0.55, 0.55 - t*0.15);
  });
}

// Lavender — soft lavender all keys, gradient top to bottom
function lavender(keys) {
  return keys.map(k => {
    const t = ny(k);
    return hsl(255, 0.60, 0.68 - t*0.22);
  });
}

// Candy Apple — bright red on alpha, orange on mods, white on space
function candyApple(keys) {
  return keys.map(k => {
    if (k.name === 'Space') return hsl(0, 0, 0.92);
    if (zone(k)==='mod')   return hsl(22, 1, 0.52);
    return hsl(0, 1, 0.48);
  });
}

// Aqua Dream — rich aqua-turquoise, deeper on modifiers
function aquaDream(keys) {
  return keys.map(k => {
    if (zone(k)==='mod') return hsl(185, 1, 0.32);
    const t = nx(k);
    return hsl(178 + t*12, 1, 0.48 - t*0.05);
  });
}

// Solarized — warm solarized dark palette
function solarized(keys) {
  return keys.map(k => {
    const z = zone(k);
    if (z === 'mod') return hsl(175, 0.80, 0.38);    // solarized cyan
    if (z === 'num') return hsl(45,  0.90, 0.52);    // solarized yellow
    const t = nx(k);
    return hsl(205 + t*10, 0.55, 0.28);              // solarized base blue
  });
}

// Magma Chamber — black body with glowing red hotspots on specific keys
const MAGMA_HOT = new Set([21,34,76,111,84,97,105,118]);
function magmaChamber(keys) {
  return keys.map(k => {
    if (MAGMA_HOT.has(k.index)) return hsl(10, 1, 0.55);
    const t = nx(k)*ny(k);
    return hsl(5, 0.80, 0.04 + t*0.12);
  });
}

// Carbon Fiber — very dark grey with near-invisible column variation
function carbonFiber(keys) {
  return keys.map(k => {
    const col = Math.floor(k.x + k.w/2);
    const l = col % 2 === 0 ? 0.10 : 0.07;
    return hsl(220, 0.10, l);
  });
}

// Sundown — deep orange-red top, dark purple bottom diagonal
function sundown(keys) {
  return keys.map(k => {
    const d = nx(k)*0.3 + ny(k)*0.7;
    const h = 20 + d*240;      // orange(20) → purple(260)
    const l = 0.55 - d*0.40;
    return hsl(h, 1, Math.max(0.08, l));
  });
}

// Neon Mint — electric mint green with brighter centre column
function neonMint(keys) {
  return keys.map(k => {
    const cx = 1 - Math.abs(nx(k)-0.5)*2;
    return hsl(155, 1, 0.30 + cx*0.25);
  });
}

// Deep Indigo — rich deep indigo, lighter at left edge
function deepIndigo(keys) {
  return keys.map(k => {
    const t = nx(k);
    return hsl(245 + t*10, 0.80, 0.20 + t*0.08);
  });
}

// Storm Cloud — dark grey-blue with electric white on top 2 rows
function stormCloud(keys) {
  return keys.map(k => {
    const r = Math.round(k.y);
    if (r <= 1) return hsl(220, 0.20, 0.80 - r*0.15);  // near-white top
    return hsl(225, 0.30, 0.12 + r*0.02);              // dark storm grey
  });
}
