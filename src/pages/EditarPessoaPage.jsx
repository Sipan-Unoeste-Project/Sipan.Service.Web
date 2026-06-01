import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ApiError } from '../api/client';
import * as pessoasApi from '../api/pessoasApi';
import { usePessoas } from '../context/PessoasContext';
import PageShell from '../components/PageShell';
import PessoaForm from '../components/PessoaForm';

export default function EditarPessoaPage() {
  const { id } = useParams();
  const { pessoas, updatePessoa } = usePessoas();
  const navigate = useNavigate();
  const [pessoa, setPessoa] = useState(() => pessoas.find((p) => String(p.id) === id));
  const [loading, setLoading] = useState(!pessoa);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (pessoa) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await pessoasApi.getPessoa(id);
        if (!cancelled) setPessoa(data);
      } catch {
        if (!cancelled) setPessoa(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, pessoa]);

  const existingCPFs = pessoas
    .filter((p) => String(p.id) !== id)
    .map((p) => p.cpf.replace(/\D/g, ''));

  if (loading) {
    return (
      <PageShell title="Editar Pessoa">
        <div className="text-muted py-4">Carregando...</div>
      </PageShell>
    );
  }

  if (!pessoa) {
    return (
      <PageShell title="Pessoa não encontrada">
        <div className="text-center py-4">
          <p className="text-muted mb-3">O registro solicitado não existe ou foi removido.</p>
          <Link to="/pessoas" className="btn btn-outline-secondary">
            Voltar à lista
          </Link>
        </div>
      </PageShell>
    );
  }

  async function handleSubmit(data) {
    setErro('');
    try {
      await updatePessoa({ ...pessoa, ...data });
      navigate('/pessoas', { state: { toast: 'Pessoa atualizada com sucesso!' } });
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao atualizar pessoa.');
    }
  }

  return (
    <PageShell
      title="Editar Pessoa"
      subtitle={`Atualize os dados de ${pessoa.nome}.`}
      action={
        <Link to="/pessoas" className="btn btn-outline-secondary">
          Voltar à lista
        </Link>
      }
    >
      {erro && <div className="alert alert-danger py-2">{erro}</div>}
      <div className="card border-0 shadow-sm" style={{ maxWidth: 720 }}>
        <div className="card-body p-4">
          <PessoaForm
            initialData={pessoa}
            existingCPFs={existingCPFs}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/pessoas')}
            submitLabel="Salvar Alterações"
          />
        </div>
      </div>
    </PageShell>
  );
}
