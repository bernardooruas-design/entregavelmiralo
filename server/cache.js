// Cache em memória simples — sobrevive enquanto o servidor estiver rodando
// Para produção: substituir por Redis

const store = new Map();
const TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

function get(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > TTL_MS) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

function set(key, data) {
  store.set(key, { data, ts: Date.now() });
}

function stats() {
  return { entries: store.size };
}

module.exports = { get, set, stats };
