import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ApiError } from '../../../api/client';
import * as funcionariosApi from '../../../api/funcionariosApi';
import PageShell from '../../../components/PageShell';
import VoluntarioForm from '../components/VoluntarioForm';

export default function EditarVoluntarioPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voluntario, setVoluntario] = useState(null);
  const [existingCPFs, setExistingCPFs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [data, lista] = await Promise.all([
          funcionariosApi.getFuncionario(id),
          funcionariosApi.listFuncionarios(),
        ]);
        if (!cancelled) {
          setVoluntario(data);
          setExistingCPFs(
            lista
              .filter((f) => String(f.id) !== String(id))
              .map((f) => f.cpf.replace(/\D/g, ''))
          );
        }
      } catch {
        if (!cancelled) setVoluntario(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <PageShell title="Editar Voluntário">
        <div className="text-muted py-4">Carregando...</div>
      </PageShell>
    );
  }

  if (!voluntario) {
    return (
      <PageShell title="Voluntário não encontrado">
        <div className="text-center py-4">
          <p className="text-muted mb-3">O registro solicitado não existe ou foi removido.</p>
          <Link to="/funcionarios" className="btn btn-outline-secondary">
            Voltar à lista
          </Link>
        </div>
      </PageShell>
    );
  }

  async function handleSubmit(form) {
    setErro('');
    try {
      await funcionariosApi.updateFuncionario(voluntario.id, form);
      navigate('/funcionarios', { state: { toast: 'Voluntário atualizado com sucesso!' } });
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao atualizar voluntário.');
    }
  }

  return (
    <PageShell
      title="Editar Voluntário"
      subtitle={`Atualize os dados de ${voluntario.nome}.`}
      action={
        <Link to="/funcionarios" className="btn btn-outline-secondary">
          Voltar à lista
        </Link>
      }
    >
      {erro && <div className="alert alert-danger py-2">{erro}</div>}
      <div className="card border-0 shadow-sm" style={{ maxWidth: 720 }}>
        <div className="card-body p-4">
          <VoluntarioForm
            initialData={voluntario}
            existingCPFs={existingCPFs}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/funcionarios')}
            submitLabel="Salvar Alterações"
          />
        </div>
      </div>
    </PageShell>
  );
}
