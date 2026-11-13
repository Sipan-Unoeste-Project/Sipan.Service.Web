import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../api/client';
import * as authApi from '../api/authApi';
import PageShell from '../components/PageShell';
import FeedbackAlert from '../components/FeedbackAlert';
import { senhaForteValida, SENHA_FORTE_MSG } from '../utils/senha';

export default function TrocarSenhaPage() {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState('');
  const [msg, setMsg] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErro('');
    setMsg('');

    if (!senhaForteValida(senhaNova)) {
      setErro(SENHA_FORTE_MSG);
      return;
    }
    if (senhaNova !== confirmar) {
      setErro('A confirmação não confere com a nova senha.');
      return;
    }
    if (senhaAtual === senhaNova) {
      setErro('A nova senha deve ser diferente da atual.');
      return;
    }

    setEnviando(true);
    try {
      const data = await authApi.trocarSenha({ senhaAtual, senhaNova });
      setMsg(data.mensagem || 'Senha alterada com sucesso.');
      setSenhaAtual('');
      setSenhaNova('');
      setConfirmar('');
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível alterar a senha.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <PageShell
      title="Trocar senha"
      subtitle="Altere a senha da sua conta com segurança"
      action={
        <Link to="/inicio" className="btn btn-outline-secondary">
          Voltar
        </Link>
      }
    >
      <FeedbackAlert message={msg} />
      <FeedbackAlert message={erro} variant="danger" />

      <div className="card border-0 shadow-sm" style={{ maxWidth: 520 }}>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="senha-atual" className="form-label fw-semibold">
                Senha atual
              </label>
              <input
                id="senha-atual"
                type="password"
                className="form-control"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="senha-nova" className="form-label fw-semibold">
                Nova senha
              </label>
              <input
                id="senha-nova"
                type="password"
                className="form-control"
                value={senhaNova}
                onChange={(e) => setSenhaNova(e.target.value)}
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
            <button type="submit" className="btn btn-success" disabled={enviando}>
              {enviando ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
