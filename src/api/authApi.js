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

/** Confirma login + e-mail e retorna token de recuperação. */
export function esqueciSenha({ login, email }) {
  return apiRequest('/api/auth/esqueci-senha', {
    method: 'POST',
    body: JSON.stringify({ login, email }),
  });
}

/** Redefine senha com o token de recuperação. */
export function redefinirSenha({ token, senha }) {
  return apiRequest('/api/auth/redefinir-senha', {
    method: 'POST',
    body: JSON.stringify({ token, senha }),
  });
}

/** Troca senha do usuário logado. */
export function trocarSenha({ senhaAtual, senhaNova }) {
  return apiRequest('/api/auth/trocar-senha', {
    method: 'POST',
    body: JSON.stringify({ senhaAtual, senhaNova }),
  });
}
