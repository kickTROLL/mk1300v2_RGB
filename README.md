# MK1300 V2 Custom RGB

A browser-based per-key RGB tool for the **MK1300 V2 60% keyboard** — 140 static patterns, no bloated software required.

> **Live:** [kickTROLL.github.io/mk1300v2_RGB](https://kickTROLL.github.io/mk1300v2_RGB)

<img width="1549" height="732" alt="image" src="https://github.com/user-attachments/assets/2b7df3ad-5c9f-4317-a123-bc6b798946ce" />



---

## ⚠️ Requirements

- **Chrome or Edge** (WebHID API required — Firefox not supported)
- Close the official MK1300v2 software before connecting

---
## What's New?
- [NEW] On-board HW Animated Effects added
- [NEW] Easy to use Custom per-key RGB layout maker added
---
## Usage

1. Click **[ CONNECT ]** → select *Gaming Keyboard* from the popup
2. Click any pattern — it applies instantly to your keyboard
3. Drag the sidebar edge to resize the preview

---

## Patterns (90 total)

Organized into 8 categories:

| Category | Examples |
|----------|---------|
| 🌈 Gradient | Sunset Dusk, Aurora, Vaporwave |
| ⚡ Neon/Cyber | Cyberpunk, Holographic, Matrix |
| 🔥 Fire/Heat | Infrared, Solar Core, Lava |
| ❄️ Ice/Cryo | Arctic Ice, Cryo Core, Dual Heat |
| 🌑 Dark | Dracula, Galaxy, Obsidian |
| 🌸 Pastel | Cherry Blossom, Lavender, Orchid |
| 🏆 Metallic | Molten Gold, Copper Circuit, Rose Gold |

---

## Safety

Only **per-key RGB commands** are sent to the keyboard. Firmware flash and factory reset opcodes are hardcoded-blocked in the driver. Your keyboard cannot be bricked by this tool.

---

## Running locally

```bash
npx serve .
```
Then open `http://localhost:3000` in a Chrome window launched with the flag above.
