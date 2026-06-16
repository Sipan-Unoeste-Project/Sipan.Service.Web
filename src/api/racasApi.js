import { apiRequest, buildQuery } from './client.js';

export function listarRacas(especie) {
  if (!especie) return Promise.resolve([]);
  return apiRequest(`/api/racas${buildQuery({ especie })}`);
}

export function adicionarRaca(especie, nome) {
  if (!especie || !nome?.trim()) {
    return Promise.reject(new Error('Espécie e nome da raça são obrigatórios'));
  }

  return apiRequest('/api/racas', {
    method: 'POST',
    body: JSON.stringify({
      especie: especie.trim(),
      nome: nome.trim()
    }),
  });
}
