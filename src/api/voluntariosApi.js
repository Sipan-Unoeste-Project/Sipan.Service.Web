import { apiRequest, buildQuery } from './client.js';

export function listVoluntarios({ busca, status } = {}) {
  return apiRequest(`/api/voluntarios${buildQuery({ busca, status })}`);
}

export function getVoluntario(id) {
  return apiRequest(`/api/voluntarios/${id}`);
}

export function createVoluntario(body) {
  return apiRequest('/api/voluntarios', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateVoluntario(id, body) {
  return apiRequest(`/api/voluntarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deleteVoluntario(id) {
  return apiRequest(`/api/voluntarios/${id}`, { method: 'DELETE' });
}
