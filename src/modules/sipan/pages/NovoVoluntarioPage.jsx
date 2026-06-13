import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../../../api/client';
import * as voluntariosApi from '../../../api/voluntariosApi';
import PageShell from '../../../components/PageShell';
import VoluntarioForm from '../components/VoluntarioForm';

export default function NovoVoluntarioPage() {
  const navigate = useNavigate();
  const [erro, setErro] = useState('');
  const [existingCPFs, setExistingCPFs] = useState([]);

  useEffect(() => {
    voluntariosApi
      .listVoluntarios()
      .then((lista) => setExistingCPFs(lista.map((v) => v.cpf.replace(/\D/g, ''))))
      .catch(() => setExistingCPFs([]));
  }, []);

  async function handleSubmit(form) {
    setErro('');
    try {
      await voluntariosApi.createVoluntario(form);
      navigate('/voluntarios', { state: { toast: 'Voluntário cadastrado com sucesso!' } });
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao cadastrar voluntário.');
    }
  }

  return (
    <PageShell
      title="Novo Voluntário"
      subtitle="Preencha os dados para adicionar um novo voluntário ao cadastro."
      action={
        <Link to="/voluntarios" className="btn btn-outline-secondary">
          Voltar à lista
        </Link>
      }
    >
      {erro && <div className="alert alert-danger py-2">{erro}</div>}
      <div className="card border-0 shadow-sm" style={{ maxWidth: 720 }}>
        <div className="card-body p-4">
          <VoluntarioForm
            existingCPFs={existingCPFs}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/voluntarios')}
            submitLabel="Cadastrar Voluntário"
          />
        </div>
      </div>
    </PageShell>
  );
}
