const KEYS = {
  estoque: 'estoqueAPAC',
  campanhas: 'apac_campanhas',
  financeiro: 'apac_financeiro',
  despesas: 'apac_despesas',
  doacoes: 'apac_doacoes',
  saude: 'apac_saude',
};

const EMPTY = {
  estoque: [],
  campanhas: { ativas: [], encerradas: [] },
  financeiro: { entradas: [], saidas: [] },
  despesas: { categorias: [], despesas: [] },
  doacoes: [],
  saude: { animalId: null, registros: [], vacinas: [] },
};

export function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJson(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function loadEstoque() {
  return loadJson(KEYS.estoque, EMPTY.estoque);
}

export function saveEstoque(items) {
  saveJson(KEYS.estoque, items);
}

export function loadCampanhas() {
  return loadJson(KEYS.campanhas, EMPTY.campanhas);
}

export function saveCampanhas(data) {
  saveJson(KEYS.campanhas, data);
}

export function loadFinanceiro() {
  return loadJson(KEYS.financeiro, EMPTY.financeiro);
}

export function saveFinanceiro(data) {
  saveJson(KEYS.financeiro, data);
}

export function loadDespesas() {
  return loadJson(KEYS.despesas, EMPTY.despesas);
}

export function saveDespesas(data) {
  saveJson(KEYS.despesas, data);
}

export function loadDoacoes() {
  return loadJson(KEYS.doacoes, EMPTY.doacoes);
}

export function saveDoacoes(data) {
  saveJson(KEYS.doacoes, data);
}

export function loadSaude() {
  return loadJson(KEYS.saude, EMPTY.saude);
}

export function saveSaude(data) {
  saveJson(KEYS.saude, data);
}

export function formatBRL(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function parseValor(str) {
  if (typeof str === 'number') return str;
  const n = parseFloat(String(str).replace(/\./g, '').replace(',', '.'));
  return Number.isNaN(n) ? 0 : n;
}

export function getDataAtual() {
  return new Date().toLocaleDateString('pt-BR');
}
