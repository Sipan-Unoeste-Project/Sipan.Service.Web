import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePessoas } from '../context/PessoasContext';
import PageShell from '../components/PageShell';
import StatsCards from '../components/StatsCards';
import PessoaTable from '../components/PessoaTable';
import Toast from '../components/Toast';

export default function PessoasPage() {
  const { pessoas, deletePessoa } = usePessoas();
  const location = useLocation();
  const [toast, setToast] = useState(location.state?.toast || '');

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  function handleDelete(id) {
    deletePessoa(id);
    setToast('Pessoa excluída com sucesso.');
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
      <StatsCards pessoas={pessoas} />

      <div className="card border-0 shadow-sm">
        <div className="card-body p-3">
          <PessoaTable pessoas={pessoas} onDelete={handleDelete} />
        </div>
      </div>

      <Toast message={toast} type="success" />
    </PageShell>
  );
}
