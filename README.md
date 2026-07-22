# MK1300 V2 Custom RGB

A browser-based per-key RGB tool for the **MK1300 V2 60% keyboard** — 90 static patterns, no bloated software required.

> **Live:** [kicktroll.github.io/mk1300v2_RGB](https://kicktroll.github.io/mk1300v2_RGB)

---

## Requirements

- **Chrome or Edge** (WebHID — Firefox not supported)
- Close the official MK1300 software before connecting

---

## Usage

1. Open the tool in the flagged browser
2. Click **[ CONNECT ]** → select *Gaming Keyboard* from the popup
3. Click any pattern — it applies instantly to your keyboard
4. Drag the sidebar edge to resize the preview

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
