import { apiRequest, buildQuery } from './client.js';

export function listFuncionarios({ busca, status } = {}) {
  return apiRequest(`/api/funcionarios${buildQuery({ busca, status })}`);
}

export function createFuncionario(body) {
  return apiRequest('/api/funcionarios', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateFuncionario(id, body) {
  return apiRequest(`/api/funcionarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deleteFuncionario(id) {
  return apiRequest(`/api/funcionarios/${id}`, { method: 'DELETE' });
}
