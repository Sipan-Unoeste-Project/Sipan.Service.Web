import { apiRequest, buildQuery } from './client.js';
import { toIsoDate, formatDateBr } from '../utils/dates.js';

export function loadSaude(animalId) {
  return apiRequest(`/api/saude${buildQuery({ animal_id: animalId })}`);
}

function getRegistroRequest(animalId, form) {
  const isVacina = form.tipo === 'vacina';
  const endpoint = isVacina ? '/api/saude/vacinas' : '/api/saude/registros';
  const body = isVacina
    ? {
        animal_id: animalId,
        nome: form.titulo,
        data_aplicada: toIsoDate(form.data),
        data_proxima: toIsoDate(form.proxima),
      }
    : {
        animal_id: animalId,
        tipo: form.tipo,
        titulo: form.titulo,
        descricao: form.descricao,
        data_registro: toIsoDate(form.data),
        veterinario: form.vet,
      };

  return { endpoint, body };
}

export function createRegistro(animalId, form) {
  const { endpoint, body } = getRegistroRequest(animalId, form);
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateRegistro(id, animalId, form) {
  const { endpoint, body } = getRegistroRequest(animalId, form);
  return apiRequest(`${endpoint}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deleteRegistro(id, tipo) {
  const endpoint = tipo === 'vacina' ? '/api/saude/vacinas' : '/api/saude/registros';
  return apiRequest(`${endpoint}/${id}`, { method: 'DELETE' });
}

export function mapSaudeUi(data) {
  return {
    registros: (data.registros || []).map((r) => ({
      id: r.id,
      animal_id: r.animal_id,
      animalNome: r.animal_nome,
      tipo: r.tipo,
      titulo: r.titulo,
      descricao: r.descricao,
      data: formatDateBr(r.data_registro),
      dataIso: r.data_registro,
      vet: r.veterinario,
    })),
    vacinas: (data.vacinas || []).map((v) => ({
      id: v.id,
      animal_id: v.animal_id,
      nome: v.nome,
      aplicada: formatDateBr(v.data_aplicada),
      aplicadaIso: v.data_aplicada,
      proxima: formatDateBr(v.data_proxima),
      proximaIso: v.data_proxima,
      status: v.status,
    })),
  };
}
