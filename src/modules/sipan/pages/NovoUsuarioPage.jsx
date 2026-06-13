import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../../../api/client';
import * as usuariosApi from '../../../api/usuariosApi';
import PageShell from '../../../components/PageShell';
import UsuarioForm from '../components/UsuarioForm';

export default function NovoUsuarioPage() {
  const navigate = useNavigate();
  const [erro, setErro] = useState('');

  async function handleSubmit(form) {
    setErro('');
    try {
      await usuariosApi.createUsuario(usuariosApi.toUsuarioBody(form));
      navigate('/usuarios', { state: { toast: 'Usuário cadastrado com sucesso!' } });
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao cadastrar usuário.');
    }
  }

  return (
    <PageShell
      title="Novo Usuário"
      subtitle="Preencha os dados para adicionar um novo usuário ao sistema."
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
            onSubmit={handleSubmit}
            onCancel={() => navigate('/usuarios')}
            submitLabel="Cadastrar Usuário"
          />
        </div>
      </div>
    </PageShell>
  );
}
