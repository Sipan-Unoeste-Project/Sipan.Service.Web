import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ApiError } from '../../../api/client';
import * as usuariosApi from '../../../api/usuariosApi';
import PageShell from '../../../components/PageShell';
import UsuarioForm from '../components/UsuarioForm';

export default function EditarUsuarioPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await usuariosApi.getUsuario(id);
        if (!cancelled) setUsuario(data);
      } catch {
        if (!cancelled) setUsuario(null);
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
      <PageShell title="Editar Usuário">
        <div className="text-muted py-4">Carregando...</div>
      </PageShell>
    );
  }

  if (!usuario) {
    return (
      <PageShell title="Usuário não encontrado">
        <div className="text-center py-4">
          <p className="text-muted mb-3">O registro solicitado não existe ou foi removido.</p>
          <Link to="/usuarios" className="btn btn-outline-secondary">
            Voltar à lista
          </Link>
        </div>
      </PageShell>
    );
  }

  async function handleSubmit(form) {
    setErro('');
    try {
      await usuariosApi.updateUsuario(usuario.id, usuariosApi.toUsuarioBody(form));
      navigate('/usuarios', { state: { toast: 'Usuário atualizado com sucesso!' } });
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao atualizar usuário.');
    }
  }

  return (
    <PageShell
      title="Editar Usuário"
      subtitle={`Atualize os dados de ${usuario.nome}.`}
      action={
        <Link to="/usuarios" className="btn btn-outline-secondary">
          Voltar à lista
        </Link>
      }
    >
      {erro && <div className="alert alert-danger py-2">{erro}</div>}
      <div className="card border-0 shadow-sm" style={{ maxWidth: 720 }}>
        <div className="card-body p-4">
          <UsuarioForm
            initialData={usuario}
            isEditing
            onSubmit={handleSubmit}
            onCancel={() => navigate('/usuarios')}
            submitLabel="Salvar Alterações"
          />
        </div>
      </div>
    </PageShell>
  );
}
