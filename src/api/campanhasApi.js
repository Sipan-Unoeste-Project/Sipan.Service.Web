import { apiRequest } from './client.js';
import { toIsoDate } from '../utils/dates.js';

export function listCampanhas() {
  return apiRequest('/api/campanhas');
}

export function createCampanha(body) {
  return apiRequest('/api/campanhas', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateCampanha(id, body) {
  return apiRequest(`/api/campanhas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function registrarDoacaoCampanha(id, valor) {
  return apiRequest(`/api/campanhas/${id}/doacao`, {
    method: 'PATCH',
    body: JSON.stringify({ valor }),
  });
}

export function encerrarCampanha(id) {
  return apiRequest(`/api/campanhas/${id}/encerrar`, { method: 'PATCH' });
}

export function deleteCampanha(id) {
  return apiRequest(`/api/campanhas/${id}`, { method: 'DELETE' });
}

/** UI usa `data` (exibição); API usa `data_evento` (yyyy-MM-dd). */
export function mapCampanhaUi(c) {
  return {
    ...c,
    data: c.data_evento,
  };
}

export function formToCampanhaBody(form, status = 'planejada') {
  return {
    nome: form.nome.trim(),
    descricao: form.descricao?.trim() || null,
    data_evento: toIsoDate(form.data),
    meta: Number(String(form.meta).replace(/\./g, '').replace(',', '.')) || 0,
    status,
  };
}
