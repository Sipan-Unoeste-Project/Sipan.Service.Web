/** Carrega JSON do localStorage com fallback seguro. */
export function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/** Persiste JSON no localStorage. */
export function saveJson(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

/** Garante `id` em cada item de uma lista. */
export function ensureIds(items) {
  const base = Date.now();
  return items.map((item, index) => ({
    ...item,
    id: item.id ?? base + index,
  }));
}

/** Migra dados de chave legada para a chave atual (uma vez). */
export function loadWithLegacy(currentKey, legacyKey, fallback = []) {
  const current = loadJson(currentKey, null);
  if (current !== null) {
    return ensureIds(Array.isArray(current) ? current : fallback);
  }

  const legacy = loadJson(legacyKey, null);
  if (legacy !== null) {
    const list = ensureIds(Array.isArray(legacy) ? legacy : fallback);
    saveJson(currentKey, list);
    localStorage.removeItem(legacyKey);
    return list;
  }

  return fallback;
}
