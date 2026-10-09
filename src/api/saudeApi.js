import { apiRequest, buildQuery } from './client.js';
import { toIsoDate, formatDateBr } from '../utils/dates.js';

export function loadSaude(animalId, { incluirAnulados = false } = {}) {
  const query = buildQuery({
    animal_id: animalId,
    incluir_anulados: incluirAnulados ? 'true' : undefined,
  });
  return apiRequest(`/api/saude${query}`);
}

function getRegistroRequest(animalId, form, isVacina = form.tipo === 'vacina') {
  const endpoint = isVacina ? '/api/saude/vacinas' : '/api/saude/registros';
  const body = isVacina
    ? {
        animal_id: animalId,
        nome: form.titulo,
        data_aplicada: toIsoDate(form.data),
        data_proxima: toIsoDate(form.proxima),
        descricao: form.descricao,
        veterinario: form.vet,
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

export function updateRegistro(id, animalId, form, origem) {
  const isVacina = origem ? origem === 'vacina' : form.tipo === 'vacina';
  const { endpoint, body } = getRegistroRequest(animalId, form, isVacina);
  return apiRequest(`${endpoint}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function anularRegistro(id, tipo, motivo) {
  const endpoint = tipo === 'vacina' ? '/api/saude/vacinas' : '/api/saude/registros';
  return apiRequest(`${endpoint}/${id}/anular`, {
    method: 'POST',
    body: JSON.stringify({ motivo }),
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
      dataIso: r.data_registro,
      vet: r.veterinario,
      criadoPorId: r.criado_por_id,
      criadoPorNome: r.criado_por_nome,
      alteradoPorId: r.alterado_por_id,
      alteradoPorNome: r.alterado_por_nome,
      atualizadoEm: r.updated_at,
      anuladaEm: r.anulada_em,
      anuladaPorId: r.anulada_por_id,
      anuladaPorNome: r.anulada_por_nome,
      motivoAnulacao: r.motivo_anulacao,
    })),
    vacinas: (data.vacinas || []).map((v) => ({
      id: v.id,
      animal_id: v.animal_id,
      nome: v.nome,
      aplicada: formatDateBr(v.data_aplicada),
      aplicadaIso: v.data_aplicada,
      proxima: formatDateBr(v.data_proxima),
      proximaIso: v.data_proxima,
      descricao: v.descricao || '',
      vet: v.veterinario || '',
      criadoPorId: v.criado_por_id,
      criadoPorNome: v.criado_por_nome,
      alteradoPorId: v.alterado_por_id,
      alteradoPorNome: v.alterado_por_nome,
      atualizadoEm: v.updated_at,
      anuladaEm: v.anulada_em,
      anuladaPorId: v.anulada_por_id,
      anuladaPorNome: v.anulada_por_nome,
      motivoAnulacao: v.motivo_anulacao,
      animalNome: v.animal_nome,
      status: v.status,
    })),
  };
}
