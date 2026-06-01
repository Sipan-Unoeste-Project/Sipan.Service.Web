import { apiRequest, buildQuery } from './client.js';
import { toIsoDate, formatDateBr } from '../utils/dates.js';

export function loadSaude(animalId) {
  return apiRequest(`/api/saude${buildQuery({ animal_id: animalId })}`);
}

export function createRegistro(animalId, form) {
  return apiRequest('/api/saude/registros', {
    method: 'POST',
    body: JSON.stringify({
      animal_id: animalId,
      tipo: form.tipo,
      titulo: form.titulo,
      descricao: form.descricao,
      data_registro: toIsoDate(form.data),
      veterinario: form.vet,
    }),
  });
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
      vet: r.veterinario,
    })),
    vacinas: (data.vacinas || []).map((v) => ({
      id: v.id,
      animal_id: v.animal_id,
      nome: v.nome,
      aplicada: formatDateBr(v.data_aplicada),
      proxima: formatDateBr(v.data_proxima),
      status: v.status,
    })),
  };
}
