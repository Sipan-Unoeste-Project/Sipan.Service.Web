import { useState, useCallback } from 'react';
import PageShell from '../../../components/PageShell';
import ConfirmModal from '../../../components/ConfirmModal';
import FeedbackAlert from '../../../components/FeedbackAlert';
import Toast from '../../../components/Toast';
import { useTimedMessage } from '../../../hooks/useTimedMessage';
import FormSolicitacao from '../components/FormSolicitacaoAdocao';
import ListaSolicitacoes from '../components/ListaSolicitacaoAdocao';

export default function SolicitacaoAdocao() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [excluirId, setExcluirId] = useState(null);
  const [erro, setErro] = useTimedMessage(6000);
  const [toast, setToast] = useTimedMessage(3500);

  const excluirAlvo = excluirId
    ? solicitacoes.find((s) => s.id === excluirId)
    : null;

  function confirmarExclusao() {
    if (!excluirId) return;
    setSolicitacoes(solicitacoes.filter((s) => s.id !== excluirId));
    setExcluirId(null);
    setToast('Solicitação excluída com sucesso.');
  }

  function limparFiltros() {
    setBusca('');
    setStatusFiltro('');
  }

  const solicitacoesFiltradas = solicitacoes.filter((s) => {
    const termoBusca = busca.toLowerCase();
    const buscaOk = !busca || s.nomeAdotante.toLowerCase().includes(termoBusca) || s.cpf.includes(busca);
    const statusOk = !statusFiltro || s.status === statusFiltro;
    return buscaOk && statusOk;
  });

  return (
    <PageShell
      title="Solicitações de Adoção"
      subtitle="Registro e acompanhamento das solicitações de adoção de animais"
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
                placeholder="Nome ou CPF do adotante..."
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
                <option>Pendente</option>
                <option>Em análise</option>
                <option>Aprovada</option>
                <option>Recusada</option>
                <option>Concluída</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <FormSolicitacao
        solicitacoes={solicitacoes}
        setSolicitacoes={setSolicitacoes}
        editandoId={editandoId}
        setEditandoId={setEditandoId}
        onSuccess={(msg) => setToast(msg)}
        onError={setErro}
      />

      <div className="mt-4">
        {loading ? (
          <p className="text-muted">Carregando...</p>
        ) : (
          <ListaSolicitacoes
            solicitacoes={solicitacoesFiltradas}
            setSolicitacoes={setSolicitacoes}
            onExcluir={setExcluirId}
            onEditar={setEditandoId}
            onToast={setToast}
          />
        )}
      </div>

      <ConfirmModal
        show={!!excluirId}
        nome={excluirAlvo?.nomeAdotante}
        onConfirm={confirmarExclusao}
        onCancel={() => setExcluirId(null)}
      />

      <Toast message={toast} type="success" />
    </PageShell>
  );
}