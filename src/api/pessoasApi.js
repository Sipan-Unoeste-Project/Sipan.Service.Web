import { apiRequest, buildQuery } from './client.js';
import { normalizeTipos, toPessoaPayload } from '../utils/pessoaTipos.js';

export function mapPessoaUi(pessoa) {
  return {
    ...pessoa,
    tipos: normalizeTipos(pessoa),
  };
}

export function listPessoas({ tipo, busca } = {}) {
  return apiRequest(`/api/pessoas${buildQuery({ tipo, busca })}`).then((lista) =>
    lista.map(mapPessoaUi)
  );
}

export function getPessoa(id) {
  return apiRequest(`/api/pessoas/${id}`).then(mapPessoaUi);
}

export function createPessoa(form) {
  return apiRequest('/api/pessoas', {
    method: 'POST',
    body: JSON.stringify(toPessoaPayload(form)),
  }).then(mapPessoaUi);
}

export function updatePessoa(id, form) {
  return apiRequest(`/api/pessoas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(toPessoaPayload(form)),
  }).then(mapPessoaUi);
}

export function deletePessoa(id) {
  return apiRequest(`/api/pessoas/${id}`, { method: 'DELETE' });
}
