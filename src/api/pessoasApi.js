import { apiRequest, buildQuery } from './client.js';

export function listPessoas({ tipo, busca } = {}) {
  return apiRequest(`/api/pessoas${buildQuery({ tipo, busca })}`);
}

export function getPessoa(id) {
  return apiRequest(`/api/pessoas/${id}`);
}

export function createPessoa(body) {
  return apiRequest('/api/pessoas', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updatePessoa(id, body) {
  return apiRequest(`/api/pessoas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deletePessoa(id) {
  return apiRequest(`/api/pessoas/${id}`, { method: 'DELETE' });
}
