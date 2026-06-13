import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../../../api/client';
import * as adocoesApi from '../../../api/adocoesApi';
import { listAnimais } from '../../../api/animaisApi';
import PageShell from '../../../components/PageShell';
import SolicitacaoAdocaoForm from '../components/SolicitacaoAdocaoForm';

export default function NovaSolicitacaoPage() {
  const navigate = useNavigate();
  const [animais, setAnimais] = useState([]);
  const [loadingAnimais, setLoadingAnimais] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const lista = await listAnimais({ status: 'Disponível' });
        if (!cancelled) {
          setAnimais(
            lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }))
          );
        }
      } catch (err) {
        if (!cancelled) {
          setErro(
            err instanceof ApiError
              ? err.message
              : 'Não foi possível carregar os animais disponíveis.'
          );
        }
      } finally {
        if (!cancelled) setLoadingAnimais(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(form) {
    setErro('');
    try {
      await adocoesApi.createAdocao(adocoesApi.toAdocaoBody(form));
      navigate('/adocoes', { state: { toast: 'Solicitação registrada com sucesso!' } });
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao registrar solicitação.');
      throw err;
    }
  }

  return (
    <PageShell
      title="Nova Solicitação"
      subtitle="Preencha os dados para registrar uma nova solicitação de adoção."
      action={
        <Link to="/adocoes" className="btn btn-outline-secondary">
          Voltar à lista
        </Link>
      }
    >
      {erro && <div className="alert alert-danger py-2">{erro}</div>}

      <div className="card border-0 shadow-sm" style={{ maxWidth: 820 }}>
        <div className="card-body p-4">
          {loadingAnimais ? (
            <p className="text-muted mb-0">Carregando animais disponíveis...</p>
          ) : (
            <SolicitacaoAdocaoForm
              animais={animais}
              onSubmit={handleSubmit}
              onCancel={() => navigate('/adocoes')}
              submitLabel="Enviar Solicitação"
            />
          )}
        </div>
      </div>
    </PageShell>
  );
}
