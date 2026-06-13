import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ApiError } from '../../../api/client';
import * as usuariosApi from '../../../api/usuariosApi';
import PageShell from '../../../components/PageShell';
import FeedbackAlert from '../../../components/FeedbackAlert';
import Toast from '../../../components/Toast';
import UsuarioTable from '../components/UsuarioTable';

export default function Usuarios() {
  const location = useLocation();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [erroAcao, setErroAcao] = useState('');
  const [toast, setToast] = useState(location.state?.toast || '');
  const [salvandoStatusId, setSalvandoStatusId] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const lista = await usuariosApi.listUsuarios();
      setUsuarios(
        lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }))
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar usuários. Verifique se a API está em execução.'
      );
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  async function handleStatusChange(usuario, status) {
    if (usuario.status === status) return;
    setErroAcao('');
    setSalvandoStatusId(usuario.id);
    try {
      const atualizado = await usuariosApi.updateUsuario(
        usuario.id,
        usuariosApi.toUsuarioBody({ ...usuario, status, senha: '' })
      );
      setUsuarios((prev) =>
        prev
          .map((u) => (u.id === usuario.id ? atualizado : u))
          .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }))
      );
    } catch (err) {
      setErroAcao(err instanceof ApiError ? err.message : 'Erro ao alterar status.');
    } finally {
      setSalvandoStatusId(null);
    }
  }

  async function handleDelete(id) {
    setErroAcao('');
    try {
      await usuariosApi.deleteUsuario(id);
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
      setToast('Usuário excluído com sucesso.');
    } catch (err) {
      setErroAcao(err instanceof ApiError ? err.message : 'Erro ao excluir usuário.');
    }
  }

  return (
    <PageShell
      title="Usuários"
      subtitle="Controle de acesso e permissões do sistema"
      action={
        <Link to="/usuarios/novo" className="btn btn-success">
          + Novo Usuário
        </Link>
      }
    >
      <FeedbackAlert message={error} variant="danger" />
      <FeedbackAlert message={erroAcao} variant="danger" />

      <div className="card border-0 shadow-sm">
        <div className="card-body p-3">
          {loading ? (
            <p className="text-muted mb-0 py-3 text-center">Carregando usuários...</p>
          ) : (
            <UsuarioTable
              usuarios={usuarios}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              salvandoStatusId={salvandoStatusId}
            />
          )}
        </div>
      </div>

      <Toast message={toast} type="success" />
    </PageShell>
  );
}
