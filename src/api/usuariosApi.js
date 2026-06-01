import { apiRequest, buildQuery } from './client.js';

export function listUsuarios({ busca, status } = {}) {
  return apiRequest(`/api/usuarios${buildQuery({ busca, status })}`);
}

export function createUsuario(body) {
  return apiRequest('/api/usuarios', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateUsuario(id, body) {
  return apiRequest(`/api/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deleteUsuario(id) {
  return apiRequest(`/api/usuarios/${id}`, { method: 'DELETE' });
}

/** Monta corpo para POST/PUT. Envie `senha` apenas quando for definir/alterar senha. */
export function toUsuarioBody({ nome, login, email, senha, permissao, status }) {
  const body = { nome, login, email, permissao, status };
  if (senha?.trim()) body.senhaHash = senha.trim();
  return body;
}
