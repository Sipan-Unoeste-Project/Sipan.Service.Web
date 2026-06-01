/** Converte dd/MM/yyyy ou yyyy-MM-dd para yyyy-MM-dd. */
export function toIsoDate(value) {
  if (!value) return '';
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const match = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return s;
}

export function formatDateBr(iso) {
  if (!iso) return '';
  if (iso.includes('/')) return iso;
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function getDataAtualIso() {
  return new Date().toISOString().slice(0, 10);
}
