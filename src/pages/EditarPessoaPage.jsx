import { Link, useParams, useNavigate } from 'react-router-dom';
import { usePessoas } from '../context/PessoasContext';
import PageShell from '../components/PageShell';
import PessoaForm from '../components/PessoaForm';

export default function EditarPessoaPage() {
  const { id } = useParams();
  const { pessoas, updatePessoa } = usePessoas();
  const navigate = useNavigate();

  const pessoa = pessoas.find((p) => String(p.id) === id);

  const existingCPFs = pessoas
    .filter((p) => String(p.id) !== id)
    .map((p) => p.cpf.replace(/\D/g, ''));

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

  function handleSubmit(data) {
    updatePessoa({ ...pessoa, ...data });
    navigate('/pessoas', { state: { toast: 'Pessoa atualizada com sucesso!' } });
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
