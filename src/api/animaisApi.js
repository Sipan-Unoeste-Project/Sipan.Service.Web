import { apiRequest, buildQuery } from './client.js';

export function listAnimais({ busca, status } = {}) {
  return apiRequest(`/api/animais${buildQuery({ busca, status })}`);
}

export function getAnimal(id) {
  return apiRequest(`/api/animais/${id}`);
}

export function createAnimal(body) {
  return apiRequest('/api/animais', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateAnimal(id, body) {
  return apiRequest(`/api/animais/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deleteAnimal(id) {
  return apiRequest(`/api/animais/${id}`, { method: 'DELETE' });
}

/** Payload esperado pela API (camelCase, castrado boolean). */
export function toAnimalPayload(form) {
  return {
    nome: form.nome?.trim(),
    especie: form.especie?.trim(),
    raca: form.raca?.trim() || null,
    sexo: form.sexo || 'Desconhecido',
    dataNascimento: form.dataNascimento || null,
    dataAcolhimento: form.dataAcolhimento || null,
    porte: form.porte || 'Médio',
    castrado: Boolean(form.castrado),
    vacinas: form.vacinas?.trim() || null,
    sobre: form.sobre?.trim() || null,
    foto: form.foto || null,
    status: form.status || 'Disponível',
  };
}
