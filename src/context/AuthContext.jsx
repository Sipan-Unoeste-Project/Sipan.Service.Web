import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/authApi';
import { ApiError, AUTH_UNAUTHORIZED_EVENT } from '../api/client';
import { clearAuthToken, getAuthToken, setAuthToken } from '../api/authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(() => Boolean(getAuthToken()));

  useEffect(() => {
    let ativo = true;

    async function hidratar() {
      if (!getAuthToken()) {
        if (ativo) {
          setUsuario(null);
          setCarregando(false);
        }
        return;
      }
      try {
        const me = await authApi.getMe();
        if (ativo) setUsuario(me);
      } catch (err) {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          clearAuthToken();
        }
        if (ativo) setUsuario(null);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    hidratar();
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    function onUnauthorized() {
      setUsuario(null);
    }
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const value = useMemo(
    () => ({
      usuario,
      autenticado: Boolean(usuario),
      carregando,
      async entrar(login, senha) {
        const data = await authApi.login(login, senha);
        setAuthToken(data.token);
        setUsuario(data.usuario);
        return data.usuario;
      },
      async primeiroAcesso(dados) {
        const data = await authApi.criarPrimeiroAcesso(dados);
        setAuthToken(data.token);
        setUsuario(data.usuario);
        return data.usuario;
      },
      async sair() {
        try {
          await authApi.logout();
        } finally {
          clearAuthToken();
          setUsuario(null);
        }
      },
    }),
    [usuario, carregando]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }
  return ctx;
}
