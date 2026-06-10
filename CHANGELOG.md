# Changelog

## [Unreleased]
### Code Quality
- Extract shared `drawTowerPreview` to `TowerRenderer.js` (eliminated 196 lines of duplication)
- Remove dead `BuffManager.js` (312 lines, never imported)
- Delete duplicate dev server `server.py` (use `serve.js` only)
- Add ESLint + Prettier config for consistent code style

### Bug Fixes
- Fix Tauri double title bar: add `decorations: false` to `tauri.conf.json`
- Enable CSP security policy in Tauri (was `null`, now properly scoped)
- Fix falsy-value bugs: `||` → `??` in save deserialization (gold=0 no longer resets)
- Add `try/catch` to unprotected `JSON.parse` in settings window
- Add missing `.catch()` on `listSaves()` promise chain

### Error Handling
- Add global `window.onerror` + `unhandledrejection` handlers
- Replace all 15 empty `catch {}` blocks with `console.warn` throughout codebase
- Add error logging to Service Worker registration failure

### Performance
- Rewrite HUD `update()` with dirty-state detection: DOM writes only when values change (eliminates per-frame layout thrashing)
- Replace 13 `transition: all` with specific properties (`background, color, border-color, opacity`)
- Replace 34 `border-radius: 0` with CSS variable `var(--border-radius)`

### CSS Refactoring
- Add CSS variables: `--titlebar-height`, `--border-radius`, `--text-title`, `--text-accent`
- Replace hardcoded colors: `#5aa0e9`, `#6677aa`, `#a0a0c0`, `#1a1a2e` with CSS variables
- Replace hardcoded `top: 32px` (3 places) with `var(--titlebar-height)`

### Accessibility
- Add `role="img"` + `aria-label` to game canvas
- Replace `<div id="gameContainer">` with semantic `<main>`
- Add `<meta name="description">` for SEO/PWA

### DX
- Add `start` script alias to `package.json`
- Add `.idea/`, `.vscode/`, `Thumbs.db`, `.env*` to `.gitignore`
- Fix README.md: Electron → Tauri, update commands

## v1.0.0
- Zpix pixel font
- HUD offset fix
- Build menu on left panel
- Click any tile to build
- No rounded corners
