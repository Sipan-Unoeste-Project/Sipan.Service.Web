import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '../api/client';
import { getAuthStatus } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

const SENHA_FORTE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

function IconeOlho({ aberto }) {
  if (aberto) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.77 21.77 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.8 21.8 0 0 1-2.16 3.19" />
        <path d="M14.12 14.12a3 3 0 0 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function LoginPage() {
  const { entrar, primeiroAcesso, autenticado } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = location.state?.from || '/inicio';

  const [configurado, setConfigurado] = useState(true);
  const [verificando, setVerificando] = useState(true);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [primeiro, setPrimeiro] = useState({
    nome: '',
    login: '',
    email: '',
    senha: '',
  });

  useEffect(() => {
    if (autenticado) navigate(destino, { replace: true });
  }, [autenticado, destino, navigate]);

  useEffect(() => {
    let ativo = true;
    getAuthStatus()
      .then((data) => {
        if (ativo) setConfigurado(Boolean(data?.configurado));
      })
      .catch(() => {
        if (ativo) setConfigurado(true);
      })
      .finally(() => {
        if (ativo) setVerificando(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  async function handleLogin(event) {
    event.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await entrar(login.trim(), senha);
      navigate(destino, { replace: true });
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível entrar.');
    } finally {
      setEnviando(false);
    }
  }

  async function handlePrimeiroAcesso(event) {
    event.preventDefault();
    setErro('');
    if (!SENHA_FORTE.test(primeiro.senha)) {
      setErro('A senha precisa ter 8 caracteres, com maiúscula, minúscula, número e especial.');
      return;
    }
    setEnviando(true);
    try {
      await primeiroAcesso(primeiro);
      navigate('/inicio', { replace: true });
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível criar o primeiro acesso.');
    } finally {
      setEnviando(false);
    }
  }

  if (verificando) {
    return (
      <div className="container py-5 text-center text-muted">
        Carregando...
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <img src="/logo-apac.png" alt="APAC" style={{ height: 64 }} />
                <h1 className="h4 fw-bold mt-3 mb-1">
                  {configurado ? 'Entrar no SIPAN' : 'Primeiro acesso'}
                </h1>
                <p className="text-muted small mb-0">
                  {configurado
                    ? 'Use o login e a senha cadastrados em Usuários.'
                    : 'Ainda não há usuários. Crie o administrador inicial.'}
                </p>
              </div>

              {erro && <div className="alert alert-danger py-2">{erro}</div>}

              {configurado ? (
                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <label htmlFor="login" className="form-label fw-semibold">
                      Login
                    </label>
                    <input
                      id="login"
                      className="form-control"
                      value={login}
                      onChange={(e) => setLogin(e.target.value)}
                      autoComplete="username"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="senha" className="form-label fw-semibold">
                      Senha
                    </label>
                    <div className="input-group">
                      <input
                        id="senha"
                        type={mostrarSenha ? 'text' : 'password'}
                        className="form-control"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-success"
                        onClick={() => setMostrarSenha((atual) => !atual)}
                        aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                        title={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        <IconeOlho aberto={mostrarSenha} />
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-success w-100" disabled={enviando}>
                    {enviando ? 'Entrando...' : 'Entrar'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePrimeiroAcesso}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold" htmlFor="nome">
                      Nome
                    </label>
                    <input
                      id="nome"
                      className="form-control"
                      value={primeiro.nome}
                      onChange={(e) => setPrimeiro({ ...primeiro, nome: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold" htmlFor="primeiro-login">
                      Login
                    </label>
                    <input
                      id="primeiro-login"
                      className="form-control"
                      value={primeiro.login}
                      onChange={(e) => setPrimeiro({ ...primeiro, login: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold" htmlFor="email">
                      E-mail
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="form-control"
                      value={primeiro.email}
                      onChange={(e) => setPrimeiro({ ...primeiro, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold" htmlFor="primeiro-senha">
                      Senha
                    </label>
                    <div className="input-group">
                      <input
                        id="primeiro-senha"
                        type={mostrarSenha ? 'text' : 'password'}
                        className="form-control"
                        value={primeiro.senha}
                        onChange={(e) => setPrimeiro({ ...primeiro, senha: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-success"
                        onClick={() => setMostrarSenha((atual) => !atual)}
                        aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                        title={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        <IconeOlho aberto={mostrarSenha} />
                      </button>
                    </div>
                    <small className="text-muted">
                      Mínimo 8 caracteres: maiúscula, minúscula, número e especial.
                    </small>
                  </div>
                  <button type="submit" className="btn btn-success w-100" disabled={enviando}>
                    {enviando ? 'Criando...' : 'Criar administrador'}
                  </button>
                </form>
              )}

              <div className="text-center mt-3">
                <Link to="/" className="small text-decoration-none">
                  Voltar ao site
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
