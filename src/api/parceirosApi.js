import { apiRequest, buildQuery } from './client.js';

export function listarParceiros(params = {}) {
  return apiRequest(`/api/parceiros${buildQuery(params)}`);
}

export function getParceiro(id) {
  return apiRequest(`/api/parceiros/${id}`);
}

export function createParceiro(body) {
  return apiRequest('/api/parceiros', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateParceiro(id, body) {
  return apiRequest(`/api/parceiros/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deleteParceiro(id) {
  return apiRequest(`/api/parceiros/${id}`, { method: 'DELETE' });
}

export function listarTiposParceiro() {
  return apiRequest('/api/parceiros/tipos');
}

export function adicionarTipoParceiro(nome) {
  if (!nome?.trim()) {
    return Promise.reject(new Error('Nome do tipo é obrigatório'));
  }

  return apiRequest('/api/parceiros/tipos', {
    method: 'POST',
    body: JSON.stringify({ nome: nome.trim() }),
  });
}
