import { en } from './locales/en.js';
import { zh } from './locales/zh.js';

const locales = { en, zh };
let currentLang = 'zh';

export function t(key, ...args) {
  let str = locales[currentLang]?.[key];
  if (str === undefined) str = locales['en']?.[key] ?? key;
  if (args.length > 0) {
    str = str.replace(/\{(\d+)\}/g, (_, n) => args[parseInt(n)] ?? `{${n}}`);
  }
  return str;
}

export function setLanguage(lang) {
  if (locales[lang]) {
    currentLang = lang;
    return true;
  }
  return false;
}

export function getLanguage() {
  return currentLang;
}
