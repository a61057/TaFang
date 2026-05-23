# Tower Defense - User Manual

## Overview
A tower defense game built with Electron. Defend your base by strategically placing towers to stop enemies from reaching the end of the path.

## Getting Started

### Installation
```bash
npm install
npm start
```

### Controls

| Key / Action | Function |
|---|---|
| **Left Click** on tile | Build tower / Select tower |
| **Right Click** | Context menu (disabled) |
| **Space** | Start next wave |
| **P** | Pause / Resume |
| **Escape** | Close menus / Deselect |
| **F3** | Toggle debug overlay |
| **D** | Cycle tower build type (hover preview) |

### Global Shortcuts (Electron)

| Shortcut | Function |
|---|---|
| `Ctrl+Shift+P` | Pause / Resume |
| `Ctrl+Shift+S` | Quick save |
| `Ctrl+Shift+L` | Quick load |
| `Ctrl+Shift+R` | Reset game |

## Gameplay

### Waves
- Enemies come in waves of increasing difficulty.
- After each wave, there is a **15-second preparation phase** to build/upgrade towers.
- Every **5th wave** features a **BOSS** enemy with high health and special abilities.
- After wave 50, the game enters **Endless Mode** where difficulty keeps scaling.

### Towers

| Tower | Cost | Description |
|---|---|---|
| **Cannon** | 100g | High single-target damage, slow fire rate |
| **Machine Gun** | 80g | Very fast fire rate, low damage per hit |
| **Mortar** | 120g | Area splash damage, medium range |
| **Frost Tower** | 70g | Slows enemies, low damage |
| **Tesla Tower** | 130g | Chain lightning hits multiple enemies |

- Towers can be **upgraded** 2 times (3 levels total).
- Towers can be **sold** for 70% of total invested gold.
- Click a built tower to see its stats and upgrade/sell options.

### Enemies

| Type | Characteristics |
|---|---|
| **Normal** | Balanced HP and speed |
| **Fast** | Low HP, high speed |
| **Heavy** | High HP, armor, slow |
| **Flying** | Ignores ground terrain effects |
| **BOSS** | Very high HP, armor, appears every 5 waves |

### Economy
- **Starting Gold**: 200g
- **Gold Sources**: Enemy bounties, wave completion rewards, perfect wave bonus (+50g), selling towers
- **Lives**: Start with 20. Each enemy that reaches the end costs 1 life (BOSS costs 5).

## UI Features

- **Hover** over tiles to see build preview
- **Hover** over enemies to see HP, speed, armor, bounty
- **Hover** over towers to see damage, range, fire rate
- Click **Next Wave** to start (available during prep phase)
- Click **Speed** to toggle between 1x / 2x / 4x
- **Settings** button opens audio and display preferences
- **Achievements** button shows unlocked achievements

## Save System

- **Auto-save** occurs after each wave completion
- **Manual save/load** with 3 save slots
- Saves are stored in the Electron user data directory

## Tips
- Use Frost Towers to slow enemies and let your damage dealers get more shots
- Mortar towers are great against grouped enemies
- Upgrade towers strategically rather than building many low-level towers
- Save gold for boss waves (every 5th wave)
- The perfect wave bonus rewards careful defense

## Troubleshooting

If the game doesn't start:
1. Ensure Node.js 18+ is installed
2. Run `npm install` to install dependencies
3. Run `npm start` to launch
4. For developer tools, use `npm run dev`

## System Requirements
- **OS**: Windows, macOS, or Linux
- **Node.js**: v18 or later
- **Memory**: 256MB minimum
- **Display**: 1280x800 recommended
