import { Link, useNavigate } from 'react-router-dom';
import { usePessoas } from '../context/PessoasContext';
import PageShell from '../components/PageShell';
import PessoaForm from '../components/PessoaForm';

export default function NovaPessoaPage() {
  const { pessoas, addPessoa } = usePessoas();
  const navigate = useNavigate();

  const existingCPFs = pessoas.map((p) => p.cpf.replace(/\D/g, ''));

  function handleSubmit(data) {
    addPessoa(data);
    navigate('/pessoas', { state: { toast: 'Pessoa cadastrada com sucesso!' } });
  }

  return (
    <PageShell
      title="Nova Pessoa"
      subtitle="Preencha os dados para adicionar uma nova pessoa ao cadastro."
      action={
        <Link to="/pessoas" className="btn btn-outline-secondary">
          Voltar à lista
        </Link>
      }
    >
      <div className="card border-0 shadow-sm" style={{ maxWidth: 720 }}>
        <div className="card-body p-4">
          <PessoaForm
            existingCPFs={existingCPFs}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/pessoas')}
            submitLabel="Cadastrar Pessoa"
          />
        </div>
      </div>
    </PageShell>
  );
}
