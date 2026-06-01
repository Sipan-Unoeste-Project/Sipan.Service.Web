import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../api/client';
import { usePessoas } from '../context/PessoasContext';
import PageShell from '../components/PageShell';
import PessoaForm from '../components/PessoaForm';

export default function NovaPessoaPage() {
  const { pessoas, addPessoa } = usePessoas();
  const navigate = useNavigate();
  const [erro, setErro] = useState('');

  const existingCPFs = pessoas.map((p) => p.cpf.replace(/\D/g, ''));

  async function handleSubmit(data) {
    setErro('');
    try {
      await addPessoa(data);
      navigate('/pessoas', { state: { toast: 'Pessoa cadastrada com sucesso!' } });
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao cadastrar pessoa.');
    }
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
      {erro && <div className="alert alert-danger py-2">{erro}</div>}
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
