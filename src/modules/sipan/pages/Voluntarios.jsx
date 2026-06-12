import { useState, useEffect, useCallback } from 'react';
import { ApiError } from '../../../api/client';
import * as funcionariosApi from '../../../api/funcionariosApi';
import PageShell from '../../../components/PageShell';
import ConfirmModal from '../../../components/ConfirmModal';
import FeedbackAlert from '../../../components/FeedbackAlert';
import Toast from '../../../components/Toast';
import { useTimedMessage } from '../../../hooks/useTimedMessage';
import FormVoluntario from '../components/FormVoluntario';
import ListaVoluntarios from '../components/ListaVoluntarios';

export default function Voluntarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [excluirId, setExcluirId] = useState(null);
  const [erro, setErro] = useTimedMessage(6000);
  const [toast, setToast] = useTimedMessage(3500);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const lista = await funcionariosApi.listFuncionarios({ busca: busca || undefined });
      let resultado = [...lista];
      if (statusFiltro) {
        resultado = resultado.filter((f) => f.status === statusFiltro);
      }
      setFuncionarios(resultado);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível carregar voluntários.');
      setFuncionarios([]);
    } finally {
      setLoading(false);
    }
  }, [busca, statusFiltro, setErro]);

  useEffect(() => {
    const timer = setTimeout(carregar, busca ? 300 : 0);
    return () => clearTimeout(timer);
  }, [carregar, busca]);

  const excluirAlvo = excluirId ? funcionarios.find((f) => f.id === excluirId) : null;

  async function confirmarExclusao() {
    if (!excluirId) return;
    try {
      await funcionariosApi.deleteFuncionario(excluirId);
      setExcluirId(null);
      setToast('Voluntário excluído com sucesso.');
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao excluir voluntário.');
      setExcluirId(null);
    }
  }

  function limparFiltros() {
    setBusca('');
    setStatusFiltro('');
  }

  return (
    <PageShell
      title="Voluntários"
      subtitle="Cadastro e gerenciamento dos voluntários do abrigo"
    >
      <FeedbackAlert message={erro} variant="danger" />

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="mb-0">Filtros</h5>
            <button className="btn btn-outline-secondary" onClick={limparFiltros}>
              Limpar
            </button>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Buscar</label>
              <input
                type="search"
                className="form-control"
                placeholder="Nome, CPF ou telefone..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={statusFiltro}
                onChange={(e) => setStatusFiltro(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <FormVoluntario
        funcionarios={funcionarios}
        setFuncionarios={setFuncionarios}
        editandoId={editandoId}
        setEditandoId={setEditandoId}
        onSuccess={(msg) => { setToast(msg); carregar(); }}
        onError={setErro}
      />

      <div className="mt-4">
        {loading ? (
          <p className="text-muted">Carregando...</p>
        ) : (
          <ListaVoluntarios
            funcionarios={funcionarios}
            onExcluir={setExcluirId}
            onEditar={setEditandoId}
          />
        )}
      </div>

      <ConfirmModal
        show={!!excluirId}
        nome={excluirAlvo?.nome}
        onConfirm={confirmarExclusao}
        onCancel={() => setExcluirId(null)}
      />

      <Toast message={toast} type="success" />
    </PageShell>
  );
}