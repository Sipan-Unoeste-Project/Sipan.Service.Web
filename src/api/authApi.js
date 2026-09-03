import { apiRequest } from './client.js';

export function getAuthStatus() {
  return apiRequest('/api/auth/status');
}

export function login(login, senha) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ login, senha }),
  });
}

export function criarPrimeiroAcesso({ nome, login, email, senha }) {
  return apiRequest('/api/auth/primeiro-acesso', {
    method: 'POST',
    body: JSON.stringify({ nome, login, email, senha }),
  });
}

export function getMe() {
  return apiRequest('/api/auth/me');
}

export function logout() {
  return apiRequest('/api/auth/logout', { method: 'POST' }).catch(() => null);
}
