export function read(key, fallback) {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}
export function write(key, value) {
  try { localStorage.setItem(key, value); } catch { /* Private mode / blocked storage. */ }
}
export function readJSON(key, fallback) {
  try { return JSON.parse(read(key, 'null')) ?? fallback; } catch { return fallback; }
}
