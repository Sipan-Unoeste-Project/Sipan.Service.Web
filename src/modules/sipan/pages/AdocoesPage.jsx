import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ApiError } from '../../../api/client';
import * as adocoesApi from '../../../api/adocoesApi';
import PageShell from '../../../components/PageShell';
import FeedbackAlert from '../../../components/FeedbackAlert';
import Toast from '../../../components/Toast';
import AdocaoTable from '../components/AdocaoTable';

export default function AdocoesPage() {
  const location = useLocation();
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [erroAcao, setErroAcao] = useState('');
  const [toast, setToast] = useState(location.state?.toast || '');
  const [salvandoStatusId, setSalvandoStatusId] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const lista = await adocoesApi.listAdocoes();
      setSolicitacoes(lista);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar as solicitações. Verifique se a API está em execução.'
      );
      setSolicitacoes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  async function handleStatusChange(solicitacao, status) {
    if (solicitacao.status === status) return;
    setErroAcao('');
    setSalvandoStatusId(solicitacao.id);
    try {
      const atualizado = await adocoesApi.updateAdocao(
        solicitacao.id,
        adocoesApi.toAdocaoBody({ ...solicitacao, status })
      );
      setSolicitacoes((prev) =>
        prev.map((s) => (s.id === solicitacao.id ? atualizado : s))
      );
    } catch (err) {
      setErroAcao(err instanceof ApiError ? err.message : 'Erro ao alterar status.');
    } finally {
      setSalvandoStatusId(null);
    }
  }

  async function handleDelete(id) {
    setErroAcao('');
    try {
      await adocoesApi.deleteAdocao(id);
      setSolicitacoes((prev) => prev.filter((s) => s.id !== id));
      setToast('Solicitação excluída com sucesso.');
    } catch (err) {
      setErroAcao(err instanceof ApiError ? err.message : 'Erro ao excluir solicitação.');
    }
  }

  return (
    <PageShell
      title="Solicitações de Adoção"
      subtitle="Registro e acompanhamento das solicitações de adoção de animais"
      action={
        <Link to="/adocoes/nova" className="btn btn-success">
          + Nova Solicitação
        </Link>
      }
    >
      <FeedbackAlert message={error} variant="danger" />
      <FeedbackAlert message={erroAcao} variant="danger" />

      <div className="card border-0 shadow-sm">
        <div className="card-body p-3">
          {loading ? (
            <p className="text-muted mb-0 py-3 text-center">Carregando solicitações...</p>
          ) : (
            <AdocaoTable
              solicitacoes={solicitacoes}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              salvandoStatusId={salvandoStatusId}
            />
          )}
        </div>
      </div>

      <Toast message={toast} type="success" />
    </PageShell>
  );
}
