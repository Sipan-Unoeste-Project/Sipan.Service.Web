import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../api/client';
import * as authApi from '../api/authApi';
import { senhaForteValida, SENHA_FORTE_MSG } from '../utils/senha';

export default function EsqueciSenhaPage() {
  const navigate = useNavigate();
  const [passo, setPasso] = useState(1);
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState('');
  const [msg, setMsg] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function confirmarIdentidade(event) {
    event.preventDefault();
    setErro('');
    setMsg('');
    setEnviando(true);
    try {
      const data = await authApi.esqueciSenha({ login: login.trim(), email: email.trim() });
      setToken(data.token);
      setMsg(data.mensagem || 'Identidade confirmada. Defina a nova senha.');
      setPasso(2);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível validar os dados.');
    } finally {
      setEnviando(false);
    }
  }

  async function salvarNovaSenha(event) {
    event.preventDefault();
    setErro('');
    setMsg('');
    if (!senhaForteValida(senha)) {
      setErro(SENHA_FORTE_MSG);
      return;
    }
    if (senha !== confirmar) {
      setErro('A confirmação não confere com a nova senha.');
      return;
    }
    setEnviando(true);
    try {
      const data = await authApi.redefinirSenha({ token, senha });
      setMsg(data.mensagem || 'Senha redefinida com sucesso.');
      setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível redefinir a senha.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <img src="/logo-apac.png" alt="APAC" style={{ height: 64 }} />
                <h1 className="h4 fw-bold mt-3 mb-1">Esqueci minha senha</h1>
                <p className="text-muted small mb-0">
                  {passo === 1
                    ? 'Informe o login e o e-mail cadastrados para recuperar o acesso.'
                    : 'Defina uma nova senha forte para a sua conta.'}
                </p>
              </div>

              {erro && <div className="alert alert-danger py-2">{erro}</div>}
              {msg && <div className="alert alert-success py-2">{msg}</div>}

              {passo === 1 ? (
                <form onSubmit={confirmarIdentidade}>
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
                    <label htmlFor="email" className="form-label fw-semibold">
                      E-mail
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-success w-100" disabled={enviando}>
                    {enviando ? 'Validando...' : 'Continuar'}
                  </button>
                </form>
              ) : (
                <form onSubmit={salvarNovaSenha}>
                  <div className="mb-3">
                    <label htmlFor="nova-senha" className="form-label fw-semibold">
                      Nova senha
                    </label>
                    <input
                      id="nova-senha"
                      type="password"
                      className="form-control"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                    <small className="text-muted">{SENHA_FORTE_MSG}</small>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="confirmar-senha" className="form-label fw-semibold">
                      Confirmar nova senha
                    </label>
                    <input
                      id="confirmar-senha"
                      type="password"
                      className="form-control"
                      value={confirmar}
                      onChange={(e) => setConfirmar(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-success w-100" disabled={enviando}>
                    {enviando ? 'Salvando...' : 'Salvar nova senha'}
                  </button>
                </form>
              )}

              <div className="text-center mt-3">
                <Link to="/login" className="small text-decoration-none">
                  Voltar ao login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
