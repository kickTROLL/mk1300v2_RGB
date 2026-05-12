/**
 * extra-effects.js — 50 contrasty, non-gradient patterns
 * Requires helpers from effects.js re-declared here for independence.
 */
import { KB_WIDTH, KB_HEIGHT } from './keyboard-layout.js';

// ── Helpers (mirror of effects.js) ──────────────────────────────────────────
function hsl(h,s,l){
  h=((h%360)+360)%360;s=Math.max(0,Math.min(1,s));l=Math.max(0,Math.min(1,l));
  const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;
  let r,g,b;
  if(h<60){r=c;g=x;b=0}else if(h<120){r=x;g=c;b=0}else if(h<180){r=0;g=c;b=x}
  else if(h<240){r=0;g=x;b=c}else if(h<300){r=x;g=0;b=c}else{r=c;g=0;b=x}
  return{r:Math.round((r+m)*255),g:Math.round((g+m)*255),b:Math.round((b+m)*255)};
}
function heatColor(heat,scale){
  heat=Math.max(0,Math.min(1,heat));
  if(scale==='ir'){
    if(heat<0.25)return hsl(0,1,heat*2);
    if(heat<0.55)return hsl((heat-0.25)*100,1,0.50);
    if(heat<0.80)return hsl(30+(heat-0.55)*120,1,0.55);
    return hsl(60,1,0.55+(heat-0.80)*2.25);
  }
  if(scale==='cryo'){
    if(heat<0.30)return hsl(240,1,heat*1.5);
    if(heat<0.65)return hsl(200,1,0.35+(heat-0.30)*0.6);
    return hsl(200,0.3-(heat-0.65)*0.9,0.75+(heat-0.65)*0.7);
  }
  return hsl(0,0,heat);
}
const OFF={r:0,g:0,b:0};
function nx(k){return(k.x+k.w/2)/KB_WIDTH;}
function ny(k){return(k.y+k.h/2)/KB_HEIGHT;}
function col(k){return Math.floor(k.x+k.w/2);}
function zone(k){
  const n=k.name;
  if(['Esc','Tab','Caps','Shift','Ctrl','Win','Alt','Menu','Fn','←','Enter','Space'].includes(n))return'mod';
  if(['1','2','3','4','5','6','7','8','9','0','-','='].includes(n))return'num';
  return'alpha';
}
function hash(k){return Math.abs(Math.sin(k.index*137.508+42));}

// ── 50 Contrasty Patterns ───────────────────────────────────────────────────

function checkerboard(keys){
  return keys.map(k=>{const r=Math.round(k.y),c=col(k);return(r+c)%2===0?hsl(300,1,0.52):hsl(270,0.35,0.07);});
}
function cyberStripes(keys){
  return keys.map(k=>{const c=col(k)%3;return c===0?hsl(300,1,0.52):c===1?hsl(186,1,0.52):hsl(270,0.25,0.06);});
}
function yinYang(keys){
  return keys.map(k=>nx(k)<0.5?hsl(300,1,0.52):hsl(186,1,0.52));
}
function typeGlow(keys){
  return keys.map(k=>zone(k)==='alpha'?hsl(210,0.08,0.92):zone(k)==='num'?hsl(210,0.20,0.55):hsl(220,0.50,0.06));
}
function rowNeon(keys){
  const hues=[0,60,120,200,280];
  return keys.map(k=>hsl(hues[Math.round(k.y)]??0,1,0.52));
}
function bullsEye(keys){
  const H=[0,60,186,300];
  return keys.map(k=>{const ring=Math.floor((Math.abs(nx(k)-0.5)+Math.abs(ny(k)-0.5))*5)%4;return hsl(H[ring],1,0.52);});
}
function policeLights(keys){
  return keys.map(k=>Math.round(k.y)===0?hsl(0,0,0.92):nx(k)<0.5?hsl(0,1,0.52):hsl(220,1,0.52));
}
function phantomKeys(keys){
  return keys.map(k=>{const h=hash(k);return h>0.72?hsl(h*360,1,0.55):OFF;});
}
function binary(keys){
  return keys.map(k=>k.index%2===0?hsl(120,1,0.50):hsl(240,0.30,0.05));
}
function rave(keys){
  return keys.map(k=>hsl(hash(k)*360,1,0.52));
}
function disco(keys){
  return keys.map(k=>hsl(((Math.round(k.y)*5+col(k))*23)%360,0.95,0.50));
}
function vampire(keys){
  return keys.map(k=>col(k)%2===0?hsl(0,1,0.50):hsl(5,0.70,0.14));
}
function stainedGlass(keys){
  return keys.map(k=>hsl(((Math.round(k.y)*3+Math.floor(col(k)/3))*47)%360,0.90,0.48));
}
function laserGrid(keys){
  return keys.map(k=>{const r=Math.round(k.y),c=col(k);return(r===0||r===4||c===0||c>=13)?hsl(186,1,0.60):hsl(186,0.30,0.04);});
}
function diagonalStripes(keys){
  const H=[0,55,186,300];
  return keys.map(k=>hsl(H[(Math.round(k.y)+col(k))%4],1,0.52));
}
function flameRow(keys){
  const lut=[{h:50,l:0.85},{h:30,l:0.58},{h:10,l:0.42},{h:0,l:0.25},{h:0,l:0.08}];
  return keys.map(k=>{const e=lut[4-Math.round(k.y)]||lut[4];return hsl(e.h,1,e.l);});
}
function voidPortal(keys){
  return keys.map(k=>{const d=(1-Math.abs(nx(k)-0.5)*2+1-Math.abs(ny(k)-0.5)*2)/2;return d>0.70?hsl(300,1,0.65):d>0.45?hsl(186,1,0.52):d>0.25?hsl(270,0.60,0.15):hsl(270,0.30,0.04);});
}
function sunriseFire(keys){
  const lut=[{h:55,l:0.90},{h:50,l:0.58},{h:25,l:0.50},{h:5,l:0.38},{h:0,l:0.12}];
  return keys.map(k=>hsl(lut[Math.round(k.y)].h,1,lut[Math.round(k.y)].l));
}
function neonBlueprint(keys){
  return keys.map(k=>zone(k)==='mod'?hsl(186,1,0.55):zone(k)==='alpha'?hsl(210,0.08,0.88):hsl(220,0.80,0.18));
}
const CHERRY_BOMBS=new Set([21,76,84,97,111]);
function cherryBomb(keys){
  return keys.map(k=>CHERRY_BOMBS.has(k.index)?hsl(0,1,0.55):zone(k)==='alpha'?hsl(340,0.55,0.22):hsl(0,0.40,0.06));
}
function toxicRain(keys){
  return keys.map(k=>{const c=col(k),peak=(c*73+11)%5,d=Math.abs(Math.round(k.y)-peak);return hsl(100+c*3,1,Math.max(0.04,0.55-d*0.12));});
}
function pinstripe(keys){
  return keys.map(k=>col(k)%2===0?hsl(180,0.05,0.88):hsl(220,0.40,0.06));
}
function glitch(keys){
  const H=[180,300,55,120,200];
  return keys.map(k=>hash(k)>0.88?OFF:hsl(H[Math.round(k.y)],1,0.50));
}
function heatZone(keys){
  return keys.map(k=>zone(k)==='alpha'?hsl(30+nx(k)*20,1,0.62):zone(k)==='num'?hsl(15,1,0.48):hsl(0,0.30,0.06));
}
function iceSpike(keys){
  return keys.map(k=>{const r=Math.round(k.y);return r===0?hsl(200,0.15,0.92):hsl(205,0.80,Math.max(0.08,0.45-r*0.06));});
}
function acidWash(keys){
  return keys.map(k=>{if(zone(k)==='mod')return hsl(80,0.30,0.05);const w=Math.sin(nx(k)*10+ny(k)*6)*0.5+0.5;return hsl(75+w*20,1,0.30+w*0.22);});
}
function neonTetris(keys){
  const C=[hsl(186,1,0.52),hsl(45,1,0.52),hsl(270,1,0.52),hsl(120,1,0.45),hsl(0,1,0.52)];
  return keys.map(k=>C[Math.round(k.y)]||C[0]);
}
function camo(keys){
  return keys.map(k=>{const h=hash(k);return h>0.65?hsl(90,0.50,0.22):h>0.35?hsl(35,0.45,0.18):hsl(110,0.25,0.08);});
}
function deepMagma(keys){
  return keys.map(k=>heatColor(1-Math.sqrt((1-nx(k))**2+(1-ny(k))**2)/Math.SQRT2*0.95,'ir'));
}
function frozenTundra(keys){
  return keys.map(k=>heatColor(1-Math.sqrt(nx(k)**2+ny(k)**2)/Math.SQRT2*0.90,'cryo'));
}
function rowCheckerboard(keys){
  const H=[300,186,55,120,270];
  return keys.map(k=>{const r=Math.round(k.y);return col(k)%2===0?hsl(H[r],1,0.52):hsl(H[r],0.30,0.08);});
}
function neonCross(keys){
  return keys.map(k=>{const r=Math.round(k.y),c=col(k),isCR=(r===2),isCL=(c>=6&&c<=8);return(isCR&&isCL)?hsl(186,0.20,0.92):isCR||isCL?hsl(186,1,0.52):hsl(220,0.40,0.06);});
}
function horror(keys){
  return keys.map(k=>(Math.round(k.y)+col(k))%2===0?hsl(0,1,0.30):hsl(0,0.40,0.04));
}
function neonGradientStripe(keys){
  return keys.map(k=>{const h=col(k)%2===0?300:55;return hsl(h,1,0.45+(1-ny(k))*0.10);});
}
function goldRush(keys){
  return keys.map(k=>zone(k)==='mod'?hsl(44,1,0.52):hsl(30,0.50,0.06+hash(k)*0.06));
}
function rainbowDiagonal(keys){
  return keys.map(k=>hsl((nx(k)+ny(k))/2*360,1,0.50));
}
function acidCheckerboard(keys){
  return keys.map(k=>(Math.round(k.y)+col(k))%2===0?hsl(100,1,0.52):hsl(320,1,0.52));
}
const SPOT_ESC=21;
function spotlightEsc(keys){
  return keys.map(k=>k.index===SPOT_ESC?hsl(55,1,0.92):hsl(50,0.50,Math.max(0,0.20-Math.sqrt(nx(k)**2+ny(k)**2)*0.18)));
}
function neonRowsAlt(keys){
  return keys.map(k=>Math.round(k.y)%2===0?hsl(300,1,0.55):hsl(270,0.30,0.06));
}
function emberWaves(keys){
  return keys.map(k=>{const w=Math.sin(nx(k)*Math.PI*4+ny(k)*Math.PI*2)*0.5+0.5;return hsl(10+w*30,1,0.15+w*0.40);});
}
function neonBlocks(keys){
  return keys.map(k=>hsl(((Math.floor(col(k)/3)*3+Math.floor(Math.round(k.y)/2))*61)%360,1,0.50));
}
function ultrawideStripe(keys){
  const H=[0,186,270];
  return keys.map(k=>hsl(H[Math.min(2,Math.floor(col(k)/5))],1,0.52));
}
function midnightFire(keys){
  return keys.map(k=>{const r=Math.round(k.y);return r===0?hsl(35,1,0.60):r===1?hsl(10,1,0.42):hsl(270,0.60,0.08+(1-ny(k))*0.04);});
}
function lavaCheckerboard(keys){
  return keys.map(k=>(Math.round(k.y)+col(k))%2===0?hsl(20,1,0.52):hsl(10,0.50,0.07));
}
const FROSTBITE_SET=new Set([111]);
function frostbite(keys){
  return keys.map(k=>FROSTBITE_SET.has(k.index)?hsl(200,0.10,0.92):zone(k)==='alpha'?hsl(200,1,0.55):zone(k)==='num'?hsl(205,0.80,0.35):hsl(220,0.60,0.10));
}
function hotSpots(keys){
  return keys.map(k=>{const x=nx(k),y=ny(k);const d=Math.max(1-Math.sqrt(x**2+y**2)/Math.SQRT2,1-Math.sqrt((1-x)**2+(1-y)**2)/Math.SQRT2,1-Math.sqrt((x-0.5)**2+(y-0.5)**2)/(Math.SQRT2/2));return heatColor(d*0.95,'ir');});
}
function pixelFlag(keys){
  return keys.map(k=>nx(k)<0.33?hsl(0,1,0.50):nx(k)<0.66?hsl(0,0,0.90):hsl(220,1,0.45));
}
function spectrumCross(keys){
  return keys.map(k=>{const r=Math.round(k.y),c=col(k),isCR=(r===2),isCL=(c>=6&&c<=8);return(isCR&&isCL)?hsl(0,0,0.96):isCR?hsl(ny(k)*240,1,0.52):isCL?hsl(nx(k)*360,1,0.52):hsl(220,0.30,0.06);});
}
const DEEP_CHERRY=new Set([21,76,84,97,111,105,117]);
function deepCherry(keys){
  return keys.map(k=>DEEP_CHERRY.has(k.index)?hsl(348,1,0.55):zone(k)==='alpha'?hsl(340,0.65,0.18):hsl(345,0.40,0.06));
}
function electricFence(keys){
  return keys.map(k=>Math.floor(col(k)/2)%2===0?hsl(186,1,0.55):hsl(220,0.30,0.05));
}

export const EXTRA_PATTERNS = [
  {id:'checkerboard',  name:'Checkerboard',      icon:'♟️', fn:checkerboard},
  {id:'cyberstripes',  name:'Cyber Stripes',      icon:'⚡', fn:cyberStripes},
  {id:'yinyang',       name:'Yin Yang',           icon:'☯️', fn:yinYang},
  {id:'typeglow',      name:'Type Glow',          icon:'⌨️', fn:typeGlow},
  {id:'rowneon',       name:'Row Neon',           icon:'📊', fn:rowNeon},
  {id:'bullseye',      name:"Bull's Eye",         icon:'🎯', fn:bullsEye},
  {id:'policelight',   name:'Police Lights',      icon:'🚔', fn:policeLights},
  {id:'phantom',       name:'Phantom Keys',       icon:'👻', fn:phantomKeys},
  {id:'binary',        name:'Binary',             icon:'💻', fn:binary},
  {id:'rave',          name:'Rave',               icon:'🎉', fn:rave},
  {id:'disco',         name:'Disco Floor',        icon:'🪩', fn:disco},
  {id:'vampire',       name:'Vampire',            icon:'🧛', fn:vampire},
  {id:'stainedglass',  name:'Stained Glass',      icon:'🪟', fn:stainedGlass},
  {id:'lasergrid',     name:'Laser Grid',         icon:'🔴', fn:laserGrid},
  {id:'diagstripes',   name:'Diagonal Stripes',   icon:'↗️', fn:diagonalStripes},
  {id:'flamerow',      name:'Flame Row',          icon:'🔥', fn:flameRow},
  {id:'voidportal',    name:'Void Portal',        icon:'🌀', fn:voidPortal},
  {id:'sunrisefire',   name:'Sunrise Fire',       icon:'🌄', fn:sunriseFire},
  {id:'neobluprint',   name:'Neon Blueprint',     icon:'📐', fn:neonBlueprint},
  {id:'cherrybomb',    name:'Cherry Bomb',        icon:'💣', fn:cherryBomb},
  {id:'toxicrain',     name:'Toxic Rain',         icon:'☣️', fn:toxicRain},
  {id:'pinstripe',     name:'Pinstripe',          icon:'👔', fn:pinstripe},
  {id:'glitch',        name:'Glitch',             icon:'📺', fn:glitch},
  {id:'heatzone',      name:'Heat Zone',          icon:'♨️', fn:heatZone},
  {id:'icespike',      name:'Ice Spike',          icon:'🧊', fn:iceSpike},
  {id:'acidwash',      name:'Acid Wash',          icon:'🧪', fn:acidWash},
  {id:'neontetris',    name:'Neon Tetris',        icon:'🟦', fn:neonTetris},
  {id:'camo',          name:'Camo',               icon:'🫙', fn:camo},
  {id:'deepmagma',     name:'Deep Magma',         icon:'🌋', fn:deepMagma},
  {id:'frozentundra',  name:'Frozen Tundra',      icon:'🏔️', fn:frozenTundra},
  {id:'rowcheck',      name:'Row Checkerboard',   icon:'🎲', fn:rowCheckerboard},
  {id:'neoncross',     name:'Neon Cross',         icon:'➕', fn:neonCross},
  {id:'horror',        name:'Horror',             icon:'💀', fn:horror},
  {id:'neonstrip2',    name:'Neon Gradient Strip',icon:'🌈', fn:neonGradientStripe},
  {id:'goldrush',      name:'Gold Rush',          icon:'💰', fn:goldRush},
  {id:'rainbowdiag',   name:'Rainbow Diagonal',   icon:'🌈', fn:rainbowDiagonal},
  {id:'acidcheck',     name:'Acid Checkerboard',  icon:'☢️', fn:acidCheckerboard},
  {id:'spotlightesc',  name:'Spotlight: Esc',     icon:'🔦', fn:spotlightEsc},
  {id:'neonrowalt',    name:'Neon Row Alt',       icon:'📶', fn:neonRowsAlt},
  {id:'emberwaves',    name:'Ember Waves',        icon:'🔥', fn:emberWaves},
  {id:'neonblocks',    name:'Neon Blocks',        icon:'🟧', fn:neonBlocks},
  {id:'uwistripe',     name:'Ultrawide Stripe',   icon:'🎌', fn:ultrawideStripe},
  {id:'midnightfire',  name:'Midnight Fire',      icon:'🌙', fn:midnightFire},
  {id:'lavacheck',     name:'Lava Checkerboard',  icon:'🌋', fn:lavaCheckerboard},
  {id:'frostbite',     name:'Frostbite',          icon:'🥶', fn:frostbite},
  {id:'hotspots',      name:'Hot Spots',          icon:'🌡️', fn:hotSpots},
  {id:'pixelflag',     name:'Pixel Flag',         icon:'🏁', fn:pixelFlag},
  {id:'spectrumcross', name:'Spectrum Cross',     icon:'✚', fn:spectrumCross},
  {id:'deepcherry',    name:'Deep Cherry',        icon:'🍒', fn:deepCherry},
  {id:'elecfence',     name:'Electric Fence',     icon:'⚡', fn:electricFence},
];
