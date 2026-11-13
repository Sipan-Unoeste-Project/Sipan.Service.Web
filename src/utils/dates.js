/** Converte dd/MM/yyyy ou yyyy-MM-dd para yyyy-MM-dd. */
export function toIsoDate(value) {
  if (!value) return '';
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const match = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return s;
}

/** Exibe data em português (dd/MM/yyyy). */
export function formatDateBr(iso) {
  if (!iso) return '';
  if (iso.includes('/') && !iso.includes('T')) return iso;
  const day = toIsoDate(iso);
  const [y, m, d] = day.split('-');
  if (!y || !m || !d) return String(iso);
  return `${d}/${m}/${y}`;
}

/** Exibe data e hora em português (ex.: 09/10/2026, 14:30). */
export function formatDateTimeBr(value) {
  if (!value) return '';
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return '';
    return value.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  const s = String(value).trim();
  // DATETIME MySQL "yyyy-MM-dd HH:mm:ss" — evita new Date() interpretar como UTC.
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (m) {
    const [, y, mo, d, h, mi] = m;
    return `${d}/${mo}/${y}, ${h}:${mi}`;
  }
  const day = toIsoDate(s);
  if (/^\d{4}-\d{2}-\d{2}$/.test(day)) return formatDateBr(day);
  const parsed = new Date(s);
  if (Number.isNaN(parsed.getTime())) return formatDateBr(s);
  return parsed.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDataAtualIso() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
