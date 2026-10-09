import { apiRequest } from './client.js';
import { toIsoDate, formatDateBr } from '../utils/dates.js';

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

const STATUS_LABEL = {
  planejada: 'Planejada',
  ativa: 'Ativa',
  concluida: 'Encerrada',
  cancelada: 'Cancelada',
};

export function labelStatusCampanha(status) {
  return STATUS_LABEL[status] || status || '';
}

/** UI com datas em português. */
export function mapCampanhaUi(c) {
  const dataInicio = c.data_inicio || c.data_evento;
  const dataFim = c.data_fim || c.data_evento;
  return {
    ...c,
    dataInicio,
    dataFim,
    dataInicioBr: formatDateBr(dataInicio),
    dataFimBr: formatDateBr(dataFim),
    createdAtBr: formatDateBr(c.created_at),
    updatedAtBr: formatDateBr(c.updated_at),
    statusLabel: labelStatusCampanha(c.status),
  };
}

export function formToCampanhaBody(form, status = 'ativa') {
  const dataInicio = toIsoDate(form.dataInicio);
  const dataFim = toIsoDate(form.dataFim);
  return {
    nome: form.nome.trim(),
    descricao: form.descricao?.trim() || null,
    data_inicio: dataInicio,
    data_fim: dataFim,
    data_evento: dataInicio,
    meta: Number(String(form.meta).replace(/\./g, '').replace(',', '.')) || 0,
    status,
  };
}
