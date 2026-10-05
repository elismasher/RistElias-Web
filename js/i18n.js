import de from '../locales/de.js';
import en from '../locales/en.js';
import { read, write } from './storage.js';

const dictionaries = { de, en };
const browserLanguage = (navigator.language || 'de').toLowerCase().startsWith('de') ? 'de' : 'en';
const storedLanguage = read('rist.lang', browserLanguage);
let language = Object.hasOwn(dictionaries, storedLanguage) ? storedLanguage : browserLanguage;
const listeners = new Set();
export const t = key => dictionaries[language][key] ?? dictionaries.de[key] ?? key;
export const getLanguage = () => language;
export function onLanguageChange(callback) { listeners.add(callback); }
export function applyLanguage(next = language) {
  if (!Object.hasOwn(dictionaries, next)) return;
  language = next;
  document.documentElement.lang = language;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  document.querySelectorAll('[data-lang]').forEach(el => {
    el.setAttribute('aria-pressed', String(el.dataset.lang === language));
  });
  for (const callback of listeners) callback();
  write('rist.lang', language);
}
