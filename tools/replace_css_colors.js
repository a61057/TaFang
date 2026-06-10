const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', '..', 'src', 'css', 'main.css');
let css = fs.readFileSync(cssPath, 'utf8');

const replacements = [
  // Backgrounds
  [/background:\s*#1a1a2e/gi, 'background: var(--bg-body)'],
  [/background:\s*#0f0f1a/gi, 'background: var(--bg-game)'],
  [/rgba\(10,\s*10,\s*20,\s*0\.85\)/gi, 'var(--bg-overlay)'],
  [/rgba\(10,\s*10,\s*20,\s*0\.92\)/gi, 'var(--bg-tooltip)'],
  [/rgba\(22,\s*33,\s*62,\s*0\.95\)/gi, 'var(--bg-surface)'],
  [/rgba\(22,\s*33,\s*62,\s*0\.97\)/gi, 'var(--bg-surface-strong)'],

  // Gradient backgrounds (HUD)
  [/linear-gradient\(180deg,\s*rgba\(22,\s*33,\s*62,\s*0\.95\)\s*0%,\s*rgba\(22,\s*33,\s*62,\s*0\.7\)\s*100%\)/gi, 'var(--gradient-hud)'],
  [/linear-gradient\(0deg,\s*rgba\(22,\s*33,\s*62,\s*0\.9\)\s*0%,\s*rgba\(22,\s*33,\s*62,\s*0\.4\)\s*100%\)/gi, 'var(--gradient-hud-bottom)'],
  [/linear-gradient\(135deg,\s*rgba\(22,\s*33,\s*62,\s*0\.97\),\s*rgba\(30,\s*40,\s*80,\s*0\.97\)\)/gi, 'var(--gradient-surface)'],

  // Text colors
  [/(?<!-)color:\s*#e0e0e0(?!\w)/gi, 'color: var(--text-primary)'],
  [/(?<!-)color:\s*#dde(?!\w)/gi, 'color: var(--text-heading)'],
  [/(?<!-)color:\s*#e0e0f0(?!\w)/gi, 'color: var(--text-bright)'],
  [/(?<!-)color:\s*#c0c0e0(?!\w)/gi, 'color: var(--text-btn)'],
  [/(?<!-)color:\s*#aab(?!\w)/gi, 'color: var(--text-secondary)'],
  [/(?<!-)color:\s*#8899bb/gi, 'color: var(--text-muted)'],
  [/(?<!-)color:\s*#889\b(?!9|\w)/gi, 'color: var(--text-muted)'],
  [/(?<!-)color:\s*#667\b(?!7|\w)/gi, 'color: var(--text-dim)'],
  [/(?<!-)color:\s*#556\b(?!6|\w)/gi, 'color: var(--text-dim)'],
  [/(?<!-)color:\s*#ffd700(?!\w)/gi, 'color: var(--color-gold)'],
  [/(?<!-)color:\s*#ffdd44/gi, 'color: var(--color-gold-light)'],
  [/(?<!-)color:\s*#e74c3c(?!\w)/gi, 'color: var(--color-red)'],
  [/(?<!-)color:\s*#66dd66(?!\w)/gi, 'color: var(--color-green)'],
  [/(?<!-)color:\s*#ff8844(?!\w)/gi, 'color: var(--color-orange)'],
  [/(?<!-)color:\s*#44ff44/gi, 'color: var(--color-green)'],

  // Accent
  [/#4a90d9(?!\w)/gi, 'var(--color-accent)'],
  [/#5aa0e9(?!\w)/gi, 'var(--color-accent-hover)'],

  // Background accent
  [/rgba\(74,\s*144,\s*217,\s*0\.\d+\)/gi, m => {
    const intensity = m.match(/0\.(\d+)/)[0];
    return `var(--color-accent-bg-${intensity.replace('.','')})`;
  }],

  // Borders
  [/rgba\(100,\s*120,\s*200,\s*0\.3\)/gi, 'var(--color-accent-border)'],
  [/rgba\(255,\s*255,\s*255,\s*0\.1\)(?!\s*(var|rgba))/gi, 'var(--border-subtle)'],
  [/rgba\(255,\s*255,\s*255,\s*0\.15\)/gi, 'var(--border-default)'],
  [/rgba\(255,\s*255,\s*255,\s*0\.08\)/gi, 'var(--border-card)'],
  [/rgba\(255,\s*255,\s*255,\s*0\.06\)/gi, 'var(--bg-card)'],
  [/rgba\(255,\s*255,\s*255,\s*0\.04\)/gi, 'var(--bg-card)'],

  // Button backgrounds
  [/rgba\(255,\s*255,\s*255,\s*0\.18\)/gi, 'var(--bg-btn-hover)'],
  [/rgba\(255,\s*255,\s*255,\s*0\.14\)/gi, 'var(--bg-btn-hover)'],
  [/rgba\(255,\s*255,\s*255,\s*0\.12\)/gi, 'var(--bg-btn-hover)'],

  // Gold borders
  [/rgba\(255,\s*215,\s*0,\s*0\.3\)/gi, 'rgba(255,215,0,0.3)'],

  // Green borders  
  [/rgba\(100,\s*200,\s*100,\s*0\.3\)/gi, 'rgba(100,200,100,0.3)'],

  // Notification backgrounds (keep as-is, distinctive)
];

for (const [pattern, replacement] of replacements) {
  if (typeof replacement === 'function') {
    css = css.replace(pattern, replacement);
  } else {
    css = css.replace(pattern, replacement);
  }
}

fs.writeFileSync(cssPath, css, 'utf8');
console.log('CSS replacements done');
