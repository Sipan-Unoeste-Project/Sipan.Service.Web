/** Utilitários compartilhados do módulo APAC (valores monetários e datas). */

export function formatBRL(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function parseValor(str) {
  if (typeof str === 'number') return str;
  const n = parseFloat(String(str).replace(/\./g, '').replace(',', '.'));
  return Number.isNaN(n) ? 0 : n;
}

/** @deprecated Use getDataAtualIso de utils/dates */
export function getDataAtual() {
  return new Date().toLocaleDateString('pt-BR');
}
