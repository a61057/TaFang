const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'src', 'css', 'main.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Split into :root block and rest
const rootMatch = css.match(/^(.*?)(:root\s*\{)([\s\S]*?)(\})\s*\n([\s\S]*)$/m);
if (!rootMatch) { console.log('No :root block found'); process.exit(1); }

const beforeRoot = rootMatch[1];
const rootOpen = rootMatch[2];
const rootBody = rootMatch[3];
const rootClose = rootMatch[4];
let rest = rootMatch[5];

const rules = [
  // Backgrounds
  [/background:\s*#1a1a2e\b(?!\w)/g, 'background: var(--bg-body)'],
  [/background:\s*#0f0f1a\b(?!\w)/g, 'background: var(--bg-game)'],
  [/rgba\(10,\s*10,\s*20,\s*0\.85\)/g, 'var(--bg-overlay)'],
  [/rgba\(10,\s*10,\s*20,\s*0\.92\)/g, 'var(--bg-tooltip)'],
  [/rgba\(15,\s*15,\s*30,\s*0\.96\)/g, 'var(--bg-surface-strong)'],

  // Panel backgrounds
  [/background:\s*rgba\(22,\s*33,\s*62,\s*0\.97\)/g, 'background: var(--bg-surface-strong)'],
  [/background:\s*rgba\(22,\s*33,\s*62,\s*0\.95\)/g, 'background: var(--bg-surface)'],

  // Gradients
  [/linear-gradient\(180deg,\s*rgba\(22,\s*33,\s*62,\s*0\.95\)\s*0%,\s*rgba\(22,\s*33,\s*62,\s*0\.7\)\s*100%\)/g, 'var(--gradient-hud)'],
  [/linear-gradient\(0deg,\s*rgba\(22,\s*33,\s*62,\s*0\.9\)\s*0%,\s*rgba\(22,\s*33,\s*62,\s*0\.4\)\s*100%\)/g, 'var(--gradient-hud-bottom)'],
  [/linear-gradient\(135deg,\s*rgba\(22,\s*33,\s*62,\s*0\.97\),\s*rgba\(30,\s*40,\s*80,\s*0\.97\)\)/g, 'var(--gradient-surface)'],

  // Text colors — only replace color: values, not border/background
  [/(?<![-a-z])color:\s*#e0e0e0\b(?!\w)/g, 'color: var(--text-primary)'],
  [/(?<![-a-z])color:\s*#dde\b(?!\w)/g, 'color: var(--text-heading)'],
  [/(?<![-a-z])color:\s*#e0e0f0\b(?!\w)/g, 'color: var(--text-bright)'],
  [/(?<![-a-z])color:\s*#c0c0e0\b(?!\w)/g, 'color: var(--text-btn)'],
  [/(?<![-a-z#])color:\s*#aab\b(?!\w)/g, 'color: var(--text-secondary)'],
  [/(?<![-a-z#])color:\s*#8899bb/g, 'color: var(--text-muted)'],
  [/(?<![-a-z#])color:\s*#889\b(?![0-9a-f])/g, 'color: var(--text-muted)'],
  [/(?<![-a-z#])color:\s*#667\b(?![0-9a-f])/g, 'color: var(--text-dim)'],
  [/(?<![-a-z#])color:\s*#556\b(?![0-9a-f])/g, 'color: var(--text-dim2)'],
  [/(?<![-a-z#])color:\s*#557\b(?![0-9a-f])/g, 'color: var(--text-dim)'],
  [/(?<![-a-z#])color:\s*#99a\b(?![0-9a-f])/g, 'color: var(--text-muted)'],

  // Semantic text
  [/(?<![-a-z])color:\s*#ffd700\b(?!\w)/g, 'color: var(--text-gold)'],
  [/(?<![-a-z])color:\s*#ffdd44/g, 'color: var(--text-gold-light)'],
  [/(?<![-a-z])color:\s*#ffdd88/g, 'color: var(--text-gold-light)'],
  [/(?<![-a-z])color:\s*#e74c3c\b(?!\w)/g, 'color: var(--text-red)'],
  [/(?<![-a-z])color:\s*#dd6666/g, 'color: var(--text-red)'],
  [/(?<![-a-z])color:\s*#66dd66\b(?!\w)/g, 'color: var(--text-green)'],
  [/(?<![-a-z])color:\s*#44ff44/g, 'color: var(--color-green)'],
  [/(?<![-a-z])color:\s*#ff8844/g, 'color: var(--color-orange)'],
  [/(?<![-a-z])color:\s*#4a90d9\b(?!\w)/g, 'color: var(--color-accent)'],

  // Accent backgrounds and borders (NOT within :root)
  [/background:\s*#4a90d9\b(?!\w)/g, 'background: var(--color-accent)'],
  [/background:\s*#5aa0e9\b(?!\w)/g, 'background: var(--color-accent-hover)'],
  [/border-color:\s*#4a90d9\b(?!\w)/g, 'border-color: var(--color-accent)'],
  [/accent-color:\s*#4a90d9\b(?!\w)/g, 'accent-color: var(--color-accent)'],

  // Borders that use #4a90d9 in shorthand border:
  [/border:\s*1px\s+solid\s+#4a90d9\b(?!\w)/g, 'border: 1px solid var(--color-accent)'],

  // RGBA white transparency
  [/rgba\(255,\s*255,\s*255,\s*0\.18\)/g, 'var(--bg-btn-hover)'],
  [/rgba\(255,\s*255,\s*255,\s*0\.14\)/g, 'var(--bg-btn-hover)'],
  [/rgba\(255,\s*255,\s*255,\s*0\.12\)/g, 'var(--bg-btn-hover)'],
  [/rgba\(255,\s*255,\s*255,\s*0\.10\)/g, 'var(--border-subtle)'],
  [/rgba\(255,\s*255,\s*255,\s*0\.1\)\s*(?![a-z-(])/g, 'var(--border-subtle) '],
  [/rgba\(255,\s*255,\s*255,\s*0\.15\)/g, 'var(--border-default)'],
  [/rgba\(255,\s*255,\s*255,\s*0\.08\)/g, 'var(--border-card)'],
  [/rgba\(255,\s*255,\s*255,\s*0\.06\)/g, 'var(--bg-btn)'],
  [/rgba\(255,\s*255,\s*255,\s*0\.04\)/g, 'var(--bg-card)'],
  [/rgba\(255,\s*255,\s*255,\s*0\.05\)/g, 'var(--bg-card)'],

  // Accent borders
  [/rgba\(100,\s*120,\s*200,\s*0\.3\)/g, 'var(--color-accent-border)'],
  [/rgba\(100,\s*120,\s*200,\s*0\.25\)/g, 'var(--color-accent-border)'],
  [/rgba\(100,\s*120,\s*200,\s*0\.2\)/g, 'var(--color-accent-border)'],
  [/rgba\(100,\s*120,\s*200,\s*0\.4\)/g, 'var(--color-accent-border)'],
  [/rgba\(100,\s*120,\s*200,\s*0\.5\)/g, 'var(--color-accent-border)'],
];

for (const [pattern, replacement] of rules) {
  rest = rest.replace(pattern, replacement);
}

// Reconstruct
css = beforeRoot + rootOpen + rootBody + rootClose + '\n' + rest;
fs.writeFileSync(cssPath, css, 'utf8');
console.log('Done. Replaced colors in CSS body (preserving :root block).');
