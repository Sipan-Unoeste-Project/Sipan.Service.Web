import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ApiError } from '../../../api/client';
import * as funcionariosApi from '../../../api/funcionariosApi';
import PageShell from '../../../components/PageShell';
import FeedbackAlert from '../../../components/FeedbackAlert';
import Toast from '../../../components/Toast';
import VoluntarioTable from '../components/VoluntarioTable';

export default function Voluntarios() {
  const location = useLocation();
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [erroAcao, setErroAcao] = useState('');
  const [toast, setToast] = useState(location.state?.toast || '');
  const [salvandoStatusId, setSalvandoStatusId] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const lista = await funcionariosApi.listFuncionarios();
      setFuncionarios(
        lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }))
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar voluntários. Verifique se a API está em execução.'
      );
      setFuncionarios([]);
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

  async function handleStatusChange(funcionario, status) {
    if (funcionario.status === status) return;
    setErroAcao('');
    setSalvandoStatusId(funcionario.id);
    try {
      const atualizado = await funcionariosApi.updateFuncionario(funcionario.id, {
        nome: funcionario.nome,
        cpf: funcionario.cpf,
        cargo: funcionario.cargo,
        telefone: funcionario.telefone,
        status,
      });
      setFuncionarios((prev) =>
        prev
          .map((f) => (f.id === funcionario.id ? atualizado : f))
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
      await funcionariosApi.deleteFuncionario(id);
      setFuncionarios((prev) => prev.filter((f) => f.id !== id));
      setToast('Voluntário excluído com sucesso.');
    } catch (err) {
      setErroAcao(err instanceof ApiError ? err.message : 'Erro ao excluir voluntário.');
    }
  }

  return (
    <PageShell
      title="Voluntários"
      subtitle="Cadastro e gerenciamento dos voluntários do abrigo"
      action={
        <Link to="/funcionarios/novo" className="btn btn-success">
          + Novo Voluntário
        </Link>
      }
    >
      <FeedbackAlert message={error} variant="danger" />
      <FeedbackAlert message={erroAcao} variant="danger" />

      <div className="card border-0 shadow-sm">
        <div className="card-body p-3">
          {loading ? (
            <p className="text-muted mb-0 py-3 text-center">Carregando voluntários...</p>
          ) : (
            <VoluntarioTable
              funcionarios={funcionarios}
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
