const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5089').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function readErrorMessage(res) {
  try {
    const data = await res.json();
    if (data?.mensagem) return data.mensagem;
  } catch {
    /* corpo vazio ou não-JSON */
  }
  return `Erro na requisição (${res.status})`;
}

/**
 * @param {string} path ex.: `/api/pessoas` ou `/api/pessoas/1`
 * @param {RequestInit} [options]
 */
export async function apiRequest(path, options = {}) {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = { ...options.headers };

  if (options.body != null && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  let res;
  try {
    res = await fetch(url, { ...options, headers });
  } catch {
    throw new ApiError(
      'Não foi possível conectar à API. Confirme se Sipan.Service.Api está rodando em ' +
        API_BASE,
      0
    );
  }

  if (res.status === 204) return null;

  if (!res.ok) {
    throw new ApiError(await readErrorMessage(res), res.status);
  }

  const text = await res.text();
  if (!text) return null;
  return JSON.parse(text);
}

/** Monta query string omitindo valores vazios. */
export function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && String(value).trim() !== '') {
      search.set(key, String(value).trim());
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}
