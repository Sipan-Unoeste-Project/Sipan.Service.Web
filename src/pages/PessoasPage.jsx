import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ApiError } from '../api/client';
import { usePessoas } from '../context/PessoasContext';
import PageShell from '../components/PageShell';
import StatsCards from '../components/StatsCards';
import PessoaTable from '../components/PessoaTable';
import Toast from '../components/Toast';
import FeedbackAlert from '../components/FeedbackAlert';

export default function PessoasPage() {
  const { pessoas, loading, error, deletePessoa } = usePessoas();
  const location = useLocation();
  const [toast, setToast] = useState(location.state?.toast || '');
  const [erroAcao, setErroAcao] = useState('');

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  async function handleDelete(id) {
    setErroAcao('');
    try {
      await deletePessoa(id);
      setToast('Pessoa excluída com sucesso.');
    } catch (err) {
      setErroAcao(err instanceof ApiError ? err.message : 'Erro ao excluir pessoa.');
    }
  }

  return (
    <PageShell
      title="Pessoas"
      subtitle="Cadastro de doadores, adotantes e voluntários"
      action={
        <Link to="/pessoas/nova" className="btn btn-success">
          + Nova Pessoa
        </Link>
      }
    >
      <FeedbackAlert message={error} variant="danger" />
      <FeedbackAlert message={erroAcao} variant="danger" />

      <StatsCards pessoas={pessoas} />

      <div className="card border-0 shadow-sm">
        <div className="card-body p-3">
          {loading ? (
            <p className="text-muted mb-0 py-3 text-center">Carregando pessoas...</p>
          ) : (
            <PessoaTable pessoas={pessoas} onDelete={handleDelete} />
          )}
        </div>
      </div>

      <Toast message={toast} type="success" />
    </PageShell>
  );
}
