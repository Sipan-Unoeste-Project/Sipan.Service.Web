import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ApiError } from '../api/client';
import * as authApi from '../api/authApi';
import { senhaForteValida, SENHA_FORTE_MSG } from '../utils/senha';

export default function EsqueciSenhaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [passo, setPasso] = useState(1);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState('');
  const [msg, setMsg] = useState('');
  const [msgVariant, setMsgVariant] = useState('success');
  const [previewUrl, setPreviewUrl] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const tokenUrl = searchParams.get('token');
    if (tokenUrl?.trim()) {
      setToken(tokenUrl.trim());
      setPasso(2);
      setMsgVariant('success');
      setMsg('Token recebido pelo link do e-mail. Defina a nova senha.');
    }
  }, [searchParams]);

  async function confirmarIdentidade(event) {
    event.preventDefault();
    setErro('');
    setMsg('');
    setPreviewUrl('');
    setEnviando(true);
    try {
      const data = await authApi.esqueciSenha({ email: email.trim() });
      const modo = data.modoEnvio || (data.emailEnviado ? 'smtp' : 'console');
      setMsgVariant(modo === 'console' ? 'warning' : 'success');
      setMsg(data.mensagem || 'Enviamos as instruções para o seu e-mail.');
      if (data.previewUrl) setPreviewUrl(data.previewUrl);
      if (data.token) setToken(data.token);
      setPasso(2);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível validar o e-mail.');
    } finally {
      setEnviando(false);
    }
  }

  async function salvarNovaSenha(event) {
    event.preventDefault();
    setErro('');
    setMsg('');
    if (!token.trim()) {
      setErro('Informe o token recebido no e-mail.');
      return;
    }
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
      const data = await authApi.redefinirSenha({ token: token.trim(), senha });
      setMsgVariant('success');
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
                    ? 'Informe o e-mail cadastrado. Enviaremos um link para redefinir a senha.'
                    : 'Use o token do e-mail e defina uma nova senha forte.'}
                </p>
              </div>

              {erro && <div className="alert alert-danger py-2">{erro}</div>}
              {msg && <div className={`alert alert-${msgVariant} py-2`}>{msg}</div>}
              {previewUrl && (
                <div className="alert alert-info py-2 small">
                  Prévia do e-mail:{' '}
                  <a href={previewUrl} target="_blank" rel="noreferrer">
                    abrir aqui
                  </a>
                </div>
              )}

              {passo === 1 ? (
                <form onSubmit={confirmarIdentidade}>
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
                    {enviando ? 'Enviando...' : 'Enviar e-mail de recuperação'}
                  </button>
                </form>
              ) : (
                <form onSubmit={salvarNovaSenha}>
                  <div className="mb-3">
                    <label htmlFor="token-recuperacao" className="form-label fw-semibold">
                      Token do e-mail
                    </label>
                    <input
                      id="token-recuperacao"
                      className="form-control"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Cole o token recebido"
                      required
                    />
                  </div>
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

              <div className="d-grid mt-3">
                <Link to="/login" className="btn btn-outline-success btn-sm">
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
