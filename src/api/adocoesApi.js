import { apiRequest, buildQuery } from './client.js';

export function listAdocoes({ busca, status } = {}) {
  return apiRequest(`/api/adocoes${buildQuery({ busca, status })}`);
}

export function getAdocao(id) {
  return apiRequest(`/api/adocoes/${id}`);
}

export function createAdocao(body) {
  return apiRequest('/api/adocoes', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateAdocao(id, body) {
  return apiRequest(`/api/adocoes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deleteAdocao(id) {
  return apiRequest(`/api/adocoes/${id}`, { method: 'DELETE' });
}

export function toAdocaoBody(form) {
  return {
    nomeAdotante: form.nomeAdotante?.trim(),
    cpf: form.cpf?.trim(),
    telefone: form.telefone?.trim(),
    email: form.email?.trim(),
    endereco: form.endereco?.trim() || null,
    animalId: Number(form.animalId),
    motivo: form.motivo?.trim(),
    temOutrosAnimais: form.temOutrosAnimais || null,
    temCriancas: form.temCriancas || null,
    tipoResidencia: form.tipoResidencia?.trim(),
    aceitaTermo: Boolean(form.aceitaTermo),
    status: form.status || 'Pendente',
  };
}
