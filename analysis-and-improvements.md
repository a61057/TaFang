# Tower Defense 项目分析与改进计划

> **生成日期**: 2026-06-09 | **JS 模块**: 51 个, ~11,061 行 | **CSS**: 1,640 行 | **技术栈**: Vanilla JS + Canvas 2D + Tauri v2

---

## 目录

- [1. 🔴 紧急问题](#1--紧急问题)
- [2. 🟡 代码质量](#2--代码质量)
- [3. 🟡 基础设施与 DX](#3--基础设施与-dx)
- [4. ⚪ 架构与技术债务](#4--架构与技术债务)
- [5. ⚪ 文档问题](#5--文档问题)
- [6. 🔵 增强与优化建议](#6--增强与优化建议)
- [7. 改进路线图](#7-改进路线图)

---

## 1. 🔴 紧急问题

### 1.1 Tauri 配置：原生标题栏与自绘标题栏冲突

**文件**: `src-tauri/tauri.conf.json:13-22`  
**问题**: CSS 代码已实现了自定义标题栏（使用 `-webkit-app-region: drag`），但 Tauri 配置**未设置 `decorations: false`**，导致运行时出现**双层标题栏**（操作系统原生 + 游戏自绘）。

**修复**: 在 `windows` 配置中添加 `"decorations": false`。

### 1.2 Tauri 配置：CSP 完全禁用

**文件**: `src-tauri/tauri.conf.json:25`  
**问题**: `"csp": null` 等于完全禁用内容安全策略，任何内联脚本都可以执行。  
**建议**: 至少设置 `default-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data:;`

### 1.3 `BuffManager.js` —— 312 行死代码

**文件**: `src/js/managers/BuffManager.js`  
**问题**: 整个文件（312 行）**未被任何模块引用**。`grep` 搜索不到任何 `import`。要么将其集成到游戏逻辑中，要么移除。

### 1.4 `bridge.js` 与 ES Modules 风格不一致

**文件**: `src/js/bridge.js`  
**问题**: 使用 ES5 IIFE + `var` 声明（11处），而整个项目其余部分使用 ES Modules + `const`/`let`。此外存在未使用的变量（如 `listen` 赋值后从未使用）。

### 1.5 文档中"Electron"应改为"Tauri"

- `README.md:22` —— 描述为 Electron 但实际已迁移到 Tauri
- `USER_MANUAL.md:1,85-86` —— 同样问题
- `package.json` 无 `start`/`pack` 脚本，但 README 中引用了它们

---

## 2. 🟡 代码质量

### 2.1 空 `catch` 块大量存在（7+ 处）

| 文件 | 行号 | 问题 |
|------|------|------|
| `GameEngine.js` | 143, 151, 158, 854 | 空 catch 静默吞错误 |
| `bridge.js` | 5, 8, 9, 12 | 空 catch 静默吞错误 |
| `ThemeManager.js` | 228-237 | 2 处空 catch |
| `AudioManager.js` | 22 (console.warn) | 唯一有日志的 catch |

**建议**: 至少 `console.warn` 错误信息，生产环境应接入错误上报。

### 2.2 未受保护的 `JSON.parse`

**文件**: `src/js/index.js:240`  
**问题**: `JSON.parse(saved)` 未包裹在 `try/catch` 中，localStorage 数据损坏时直接崩溃。

### 2.3 空 Promise chain 缺少 `.catch()`

**文件**: `src/js/ui/UIManager.js:61`  
**问题**: `this.engine.saveSystem.listSaves().then(...)` 无 `.catch()`，Promise 拒绝时产生未处理异常。

### 2.4 Unawaited async 调用

| 文件 | 行号 | 问题 |
|------|------|------|
| `GameEngine.js` | 124 | 构造函数中 `_loadSettings()` 为 async 但未 `await` |
| `GameEngine.js` | 165 | `this.audio.startBGM()` 为 async 但未 `await` |
| `GameEngine.js` | 1392 | `this.saveGame(0)` 在 `_onTutorialEnd()` 中未 `await` |

### 2.5 `||` 代替 `??` 导致 falsy 值错误

**文件**: `src/js/engine/GameEngine.js:1280-1313`  
**问题**: `state.gold || STARTING_GOLD` —— 当 `gold = 0` 时会被错误重置为默认值。应使用 `??` 空值合并运算符。

### 2.6 代码重复：塔预览渲染

**文件**: `src/js/ui/BuildMenu.js:29-127` 与 `src/js/ui/MainMenu.js:122-219`  
**问题**: 完整的 `_drawTowerPreview` 方法（~98 行）在两个文件中完全复制，包含 10 个塔类型的 switch case。应提取为共享工具函数。

### 2.7 7 个高度重复的 multiplier getter 方法

**文件**: `src/js/managers/BuffManager.js:198-287`  
**问题**: `getEnemyHpMultiplier`、`getEnemySpeedMultiplier`、`getTowerDamageMultiplier` 等 7 个方法使用完全相同的遍历模式。可简化为一个 `getMultiplier(stat)` 泛化方法。

### 2.8 全局无错误捕获

**文件**: `src/index.html`、`src/js/index.js`  
**缺失**:
```js
window.onerror = (msg, url, line, col, error) => { /* 记录 */ };
window.addEventListener('unhandledrejection', (e) => { /* 记录 */ });
```
无 `Sentry` 等错误上报服务，也无用户可见的错误提示 UI。

### 2.9 XSS 风险：`innerHTML` 直接赋值

**文件**: `src/js/index.js:146`、`src/js/ui/UIManager.js:99-157`、`src/js/ui/HUD.js:188-207`  
**问题**: 多处使用 `el.innerHTML = text`，若 `text` 包含用户控制内容可能存在 XSS。建议使用 `textContent` 或 DOMPurify 过滤。

---

## 3. 🟡 基础设施与 DX

### 3.1 无构建工具

**现状**: 使用 `<script type="module">` 直接加载 51 个模块，浏览器需发起 ~51 次 HTTP 请求。无压缩、无 Tree Shaking、无 HMR。  
**建议**: 引入 Vite 或 Rollup，实现：

- 代码压缩（生产环境下 JS 可缩减 60%+ 体积）
- Tree Shaking 移除死代码
- HMR 热更新提升开发效率
- PostCSS + Autoprefixer 自动处理 CSS 兼容性

### 3.2 无测试框架

**现状**: 项目无任何测试文件、无测试依赖。  
**测试优先级**:

| 优先级 | 模块 | 风险 |
|--------|------|------|
| 🔴 | `_serialize`/`_deserialize`（GameEngine.js:1240-1372） | 存档损坏 |
| 🔴 | `Enemy.js` 路径移动与伤害计算 | 核心玩法 |
| 🟡 | `WaveManager.js` 波次生成算法 | 难度平衡 |
| 🟡 | `FactionSystem.js` 阵营加成计算 | 数值系统 |
| 🟡 | `EventSystem.js` 随机事件触发与应用 | 逻辑正确性 |
| ⚪ | UI 组件 DOM 操作 | 交互可靠性 |

### 3.3 无 Linter / Formatter

**现状**: 无 ESLint、Prettier 配置。  
**可捕获的问题**: 未使用变量、空 catch 块、不一致引号风格、bridge.js 使用 `var` 而其他模块用 `const/let`。  
**建议**: ESLint + Prettier 标准配置，配合 Husky + lint-staged 提交前检查。

### 3.4 开发服务器重复

**文件**: `serve.js`（Node.js）与 `server.py`（Python）  
**问题**: 两个服务器做同一件事，功能重复，端口都是 3000。建议：
- 统一为一个（推荐 `serve.js`+ `concurrently` + Vite）
- 删除另一个

### 3.5 无 CI/CD

**现状**: 无 `.github/` 目录，无 CI 配置。  
**建议**: GitHub Actions 工作流包含：
- Lint + 测试（PR 检查）
- `npm audit` 依赖漏洞扫描
- Tauri 构建与 Release 自动化
- Dependabot 依赖更新

### 3.6 Service Worker 错误被吞

**文件**: `src/index.html:41`  
```js
navigator.serviceWorker.register('sw.js').catch(function() {})
```
空 catch 函数吞掉注册失败错误。

### 3.7 `.gitignore` 不完整

**缺失**: `.idea/`、`.vscode/`、`Thumbs.db`、`.env*`

---

## 4. ⚪ 架构与技术债务

### 4.1 `GameEngine` 作为上帝对象

**文件**: `src/js/engine/GameEngine.js`（1,398 行）  
**问题**: 导入 26+ 个模块，直接管理所有管理器、持有游戏状态、充当事件总线、处理输入、驱动 UI 更新。  
**建议**: 逐步将职责拆分：
- 状态管理抽离到独立的 `GameState` 对象
- 输入处理抽离到 `InputManager`
- 管理器创建与生命周期管理抽离到 `GameContext`

### 4.2 管理器间相互直接修改状态

**多处存在类似模式**:
```js
// WaveManager.js:160 - 直接操作 engine
this.gameEngine.addGold(reward);

// FlowerManager.js:43 - 直接操作 engine
this.engine.gold -= v.cost;

// EventSystem.js:75 - 直接操作 lives
ge.lives = Math.min(ge.lives + 3, 99);
```

**建议**: 通过事件系统或状态管理器统一修改入口。

### 4.3 每帧 DOM 操作导致布局抖动

**文件**: `src/js/ui/HUD.js:146-222`  
**问题**: `update()` 每帧（60fps）执行 `textContent`、`innerHTML`、`style.display`、`querySelector` 等 DOM 操作。  
**建议**:
- 使用脏标记（dirty flag）仅在实际状态变化时更新 DOM
- 或使用 Canvas 覆盖 UI 层避免 DOM 操作

### 4.4 碰撞检测性能：O(n*m) + 每帧数组分配

- `GameEngine._update()`: 每帧对英雄 × 存活敌人做嵌套循环 + `Math.sqrt`
- `EnemyManager.getAlive()`: 每帧创建新过滤数组（被多处调用）
- 建议：缓存 `alive` 数组，使用 `distSq` 避免开根号

### 4.5 序列化/反序列化脆弱

**文件**: `src/js/engine/GameEngine.js:1240-1372`  
**问题**: ~130 行手动的 `_serialize`/`_deserialize`，新增属性需要同步修改两端，无 schema 版本控制。

### 4.6 事件监听器未清理

- `GameEngine._initInput()` 在 `document` 上注册的 `keydown`/`keyup` 监听器**从未被移除**
- `window.resize` 监听器在 `index.js:394` 注册但从未移除
- `bridge.js:139` 的 `removeShortcutListeners` 是空函数

### 4.7 HUD 更新全量无脏检测

**问题**: `HUD.update()` 每帧无条件重写所有 DOM 内容。即使 gold/lives/wave 等状态无变化，仍然执行全部 DOM 写入。

### 4.8 EventSystem 中 20 个 case 只有 10 个有实现

**文件**: `src/js/managers/EventSystem.js:67-124`  
**问题**: `enemy_boost`、`fog_ahead`、`curse`、`blessing`、`swarm`、`earthquake`、`inspire`、`moonlight`、`sandstorm`、`hero_boost`、`time_warp` 等 case 为空 stub。

---

## 5. ⚪ 文档问题

### 5.1 README.md

| 问题 | 位置 |
|------|------|
| 提到 Electron（实际已迁移 Tauri） | 第 22 行 |
| `npm start` 不存在 | 第 29 行 |
| `npm run pack` 不存在 | 第 31 行 |
| 缺少 Tauri 构建流程说明 | — |
| 缺少目录结构说明（tools/、release/、server.py） | — |

### 5.2 USER_MANUAL.md

| 问题 | 位置 |
|------|------|
| 提到 Electron | 第 1、85-86 行 |
| 快捷键 `Ctrl+Shift+P/S/L/R` 在 Tauri 中无效 | 第 27-33 行 |
| 未提及英雄系统、武器商店、阵营羁绊、随机事件、天气昼夜系统、主题切换、迷你游戏、花系统、成就系统、教程 | 全文 |
| "Right Click - Context menu (disabled)" 描述落后 | 第 19 行 |

### 5.3 CHANGELOG.md

- 仅 8 行，1 个版本条目（v1.0.0）
- Git 历史有 11 次实质性提交但未反映
- 无 `[Unreleased]` 区域

---

## 6. 🔵 增强与优化建议

### 6.1 性能优化

| 优化项 | 预期效果 |
|--------|----------|
| 碰撞检测用 `distSq` 代替 `dist` | 减少 `Math.sqrt` 调用 |
| HUD 更新加 dirty flag | 减少 60fps DOM 操作 |
| CSS `transition: all` → `transition: [具体属性]`（13 处） | 减少不必要的重绘 |
| 通用选择器 `*` 限定范围 | 减少选择器匹配开销 |

### 6.2 代码现代化

| 改进 | 涉及范围 |
|------|----------|
| `||` → `??`（nullish coalescing） | `GameEngine.js` deserialize 逻辑 |
| `.find(t => Math.sqrt(...))` → `.find(t => Math.hypot(...))` | 碰撞/悬停检测 |
| 可选链 `?.` 简化层级访问 | 30+ 处表达式可简化 |
| `var` → `const`/`let` | `bridge.js` |

### 6.3 类型安全（渐进式）

- 关键数据模块（`towerData.js`、`enemyData.js`、`heroData.js`）添加 JSDoc 类型注释
- `GameEngine._serialize`/`_deserialize` 添加类型断言
- 考虑长期引入 TypeScript

### 6.4 CSS 工程化

| 改进 | 详情 |
|------|------|
| `border-radius: 0` 提取为 `--border-radius` 变量 | 30+ 处 |
| `#6677aa` 提取为 CSS 变量 | 2 处 |
| `32px`（标题栏高度）提取为变量 | 3 处 |
| 13 处 `transition: all` → 具体属性 | 性能提升 |
| 大规模 CSS 文件拆分（1640 行） | `variables.css`、`layout.css`、`hud.css`、`panels.css`、`animations.css` |
| 禁用状态样式统一（4 处重复） | 复用 `.is-disabled` |
| 添加 Firefox 友好的滚动条样式 | `scrollbar-width: thin` |

### 6.5 无障碍 & HTML 语义化

| 改进 | 位置 |
|------|------|
| Canvas 添加 `role="img"` + `aria-label` | `index.html:23` |
| `<div id="gameContainer">` → `<main>` | `index.html:22` |
| 添加 `<h1>` 标题 | `index.html` `<head>` 后 |
| 添加 `<meta name="description">` | `index.html` `<head>` |
| 添加 Open Graph / Twitter Card 标签 | `index.html` `<head>` |
| 字体预加载 `<link rel="preload">` | 防止 FOUT |

### 6.6 错误监控

- 添加 `window.onerror` + `unhandledrejection` 全局处理器
- 接入 Sentry 或自建日志端点
- 用户可见错误提示 UI

---

## 7. 改进路线图

### Phase 1 — 紧急修复（1-2 天）

- [ ] `tauri.conf.json`: 添加 `"decorations": false` + 修复 CSP
- [ ] 删除/恢复 `BuffManager.js`
- [ ] 修复 `||` → `??` 在 `_deserialize` 中
- [ ] 补全空 `catch` 块的错误日志
- [ ] 添加 `JSON.parse` try/catch 保护
- [ ] 修正文档中 "Electron" → "Tauri"
- [ ] 统一开发服务器（删掉 `serve.js` 或 `server.py`）
- [ ] 添加全局错误捕获（`window.onerror` + `unhandledrejection`）

### Phase 2 — 代码质量（3-5 天）

- [ ] 引入 ESLint + Prettier
- [ ] 引入 Jest 测试框架，为保存/加载、敌人/塔逻辑写测试
- [ ] 提取 `_drawTowerPreview` 到共享工具
- [ ] 提取 HUD dirty flag 优化每帧 DOM 操作
- [ ] 清理事件监听器生命周期（`_initInput` / `_cleanup`）
- [ ] 实现 `removeShortcutListeners` 实际清理逻辑
- [ ] 补全 `EventSystem.js` 中 10 个空 stub 的实现或移除

### Phase 3 — 工程化（1 周）

- [ ] 引入 Vite 或 Rollup 打包
- [ ] 添加 GitHub Actions CI（lint + test + build）
- [ ] 拆分 `main.css`（1640 行）为多个 CSS 模块
- [ ] CSS 变量化：提取硬编码色值、`border-radius`、标题栏高度
- [ ] 修复 13 处 `transition: all`
- [ ] 完善的 `.gitignore`
- [ ] 添加 Dependabot 依赖自动更新

### Phase 4 — 架构优化（长期）

- [ ] `GameEngine` 逐步拆分（状态管理、输入处理、管理器生命周期）
- [ ] 引入事件驱动状态变更（代替直接属性修改）
- [ ] `_serialize`/`_deserialize` 使用 schema 校验
- [ ] 性能监控（`performance.mark`、帧时间统计、慢操作检测）
- [ ] 考虑渐进式 TypeScript 迁移
- [ ] 多平台 Tauri 打包目标（MSI、DMG、AppImage）
- [ ] 添加无障碍支持（ARIA、键盘导航、屏幕阅读器）

---

> **JS 规模**: 51 模块 / ~11K 行 | **CSS 规模**: 1,640 行 | **Git 提交**: 11 次活跃开发
>
> 项目整体代码质量较高（几乎没有 TODO/FIXME 注释），但缺少工程化基础设施（测试、lint、CI）和部分架构层面的关注点（上帝对象、事件监听器生命周期）。
