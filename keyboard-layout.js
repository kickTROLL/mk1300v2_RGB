/**
 * ANT Esports MK1300 V2 — 60% keyboard layout
 * 5 rows, ~15u wide. No F-row, no numpad, no nav cluster.
 * Esc is top-left (index 0). Up arrow is in the shift row.
 */

// Row 0: Esc, 1-0, -, =, Backspace
// Row 1: Tab, Q-P, [, ], backslash
// Row 2: Caps, A-L, ;, ', Enter
// Row 3: LShift, Z-?, Up, RShift
// Row 4: Ctrl, Win, Alt, Space, Alt, Menu, Ctrl, Fn

export const KEYBOARD_LAYOUT = [
  // Row 0 — number row (y=0)
  // NOTE: Esc uses index 21 (the ~ slot in the firmware matrix).
  // Index 0 is reserved for a non-existent function-row key on the full keyboard.
  { index:21, x:0,   y:0, w:1,    h:1, name:"Esc" },
  { index:22, x:1,   y:0, w:1,    h:1, name:"1"   },
  { index:23, x:2,   y:0, w:1,    h:1, name:"2"   },
  { index:24, x:3,   y:0, w:1,    h:1, name:"3"   },
  { index:25, x:4,   y:0, w:1,    h:1, name:"4"   },
  { index:26, x:5,   y:0, w:1,    h:1, name:"5"   },
  { index:27, x:6,   y:0, w:1,    h:1, name:"6"   },
  { index:28, x:7,   y:0, w:1,    h:1, name:"7"   },
  { index:29, x:8,   y:0, w:1,    h:1, name:"8"   },
  { index:30, x:9,   y:0, w:1,    h:1, name:"9"   },
  { index:31, x:10,  y:0, w:1,    h:1, name:"0"   },
  { index:32, x:11,  y:0, w:1,    h:1, name:"-"   },
  { index:33, x:12,  y:0, w:1,    h:1, name:"="   },
  { index:34, x:13,  y:0, w:2,    h:1, name:"←"   },

  // Row 1 — QWERTY (y=1)
  { index:42, x:0,   y:1, w:1.5,  h:1, name:"Tab" },
  { index:43, x:1.5, y:1, w:1,    h:1, name:"Q"   },
  { index:44, x:2.5, y:1, w:1,    h:1, name:"W"   },
  { index:45, x:3.5, y:1, w:1,    h:1, name:"E"   },
  { index:46, x:4.5, y:1, w:1,    h:1, name:"R"   },
  { index:47, x:5.5, y:1, w:1,    h:1, name:"T"   },
  { index:48, x:6.5, y:1, w:1,    h:1, name:"Y"   },
  { index:49, x:7.5, y:1, w:1,    h:1, name:"U"   },
  { index:50, x:8.5, y:1, w:1,    h:1, name:"I"   },
  { index:51, x:9.5, y:1, w:1,    h:1, name:"O"   },
  { index:52, x:10.5,y:1, w:1,    h:1, name:"P"   },
  { index:53, x:11.5,y:1, w:1,    h:1, name:"["   },
  { index:54, x:12.5,y:1, w:1,    h:1, name:"]"   },
  { index:55, x:13.5,y:1, w:1.5,  h:1, name:"\\"  },

  // Row 2 — Home row (y=2)
  { index:63, x:0,    y:2, w:1.75, h:1, name:"Caps" },
  { index:64, x:1.75, y:2, w:1,    h:1, name:"A"   },
  { index:65, x:2.75, y:2, w:1,    h:1, name:"S"   },
  { index:66, x:3.75, y:2, w:1,    h:1, name:"D"   },
  { index:67, x:4.75, y:2, w:1,    h:1, name:"F"   },
  { index:68, x:5.75, y:2, w:1,    h:1, name:"G"   },
  { index:69, x:6.75, y:2, w:1,    h:1, name:"H"   },
  { index:70, x:7.75, y:2, w:1,    h:1, name:"J"   },
  { index:71, x:8.75, y:2, w:1,    h:1, name:"K"   },
  { index:72, x:9.75, y:2, w:1,    h:1, name:"L"   },
  { index:73, x:10.75,y:2, w:1,    h:1, name:";"   },
  { index:74, x:11.75,y:2, w:1,    h:1, name:"'"   },
  { index:76, x:12.75,y:2, w:2.25, h:1, name:"Enter"},

  // Row 3 — Shift row (y=3)
  { index:84, x:0,    y:3, w:2.25, h:1, name:"Shift"},
  { index:86, x:2.25, y:3, w:1,    h:1, name:"Z"   },
  { index:87, x:3.25, y:3, w:1,    h:1, name:"X"   },
  { index:88, x:4.25, y:3, w:1,    h:1, name:"C"   },
  { index:89, x:5.25, y:3, w:1,    h:1, name:"V"   },
  { index:90, x:6.25, y:3, w:1,    h:1, name:"B"   },
  { index:91, x:7.25, y:3, w:1,    h:1, name:"N"   },
  { index:92, x:8.25, y:3, w:1,    h:1, name:"M"   },
  { index:93, x:9.25, y:3, w:1,    h:1, name:"<"   },
  { index:94, x:10.25,y:3, w:1,    h:1, name:">"   },
  { index:95, x:11.25,y:3, w:1,    h:1, name:"?"   },
  { index:99, x:12.25,y:3, w:1,    h:1, name:"↑"   },
  { index:97, x:13.25,y:3, w:1.75, h:1, name:"Shift"},

  // Row 4 — Bottom row (y=4)
  { index:105,x:0,    y:4, w:1.25, h:1, name:"Ctrl" },
  { index:106,x:1.25, y:4, w:1.25, h:1, name:"Win"  },
  { index:107,x:2.5,  y:4, w:1.25, h:1, name:"Alt"  },
  { index:111,x:3.75, y:4, w:6.25, h:1, name:"Space" },
  { index:115,x:10,   y:4, w:1.25, h:1, name:"Alt"  },
  { index:116,x:11.25,y:4, w:1,    h:1, name:"Menu" },
  { index:117,x:12.25,y:4, w:1.25, h:1, name:"Ctrl" },
  { index:118,x:13.5, y:4, w:1.5,  h:1, name:"Fn"   },
];

export const MAX_KEY_INDEX = Math.max(...KEYBOARD_LAYOUT.map(k => k.index));
export const KEY_COUNT = MAX_KEY_INDEX + 1;
export const KB_WIDTH  = 15;   // ~15 standard key-widths
export const KB_HEIGHT = 5;    // 5 rows
