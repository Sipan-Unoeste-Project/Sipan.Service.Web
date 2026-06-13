import { useState, useEffect, useCallback } from 'react';
import PageShell from '../../components/PageShell';
import ConfirmModal from '../../components/ConfirmModal';
import FeedbackAlert from '../../components/FeedbackAlert';
import Toast from '../../components/Toast';
import { useTimedMessage } from '../../hooks/useTimedMessage';
import CardParceiro from './componentes/CardParceiro';
import FormularioParceiro from './componentes/FormularioParceiro';
import { listarParceiros, excluirParceiro } from './utils/storageParceiros';

export default function PaginaParceiros() {
  const [parceiros, setParceiros] = useState([]);
  const [parceiroParaEditar, setParceiroParaEditar] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [excluirAlvo, setExcluirAlvo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useTimedMessage(3500);
  const [erro, setErro] = useTimedMessage(6000);

  const carregarParceiros = useCallback(async () => {
    setLoading(true);
    try {
      const lista = await listarParceiros();
      setParceiros(lista);
    } catch (error) {
      console.error('Erro ao carregar parceiros:', error);
      setErro('Não foi possível carregar a lista de parceiros.');
    } finally {
      setLoading(false);
    }
  }, [setErro]);

  useEffect(() => {
    carregarParceiros();
  }, [carregarParceiros]);

  const handleSalvar = async () => {
    setMostrarFormulario(false);
    setParceiroParaEditar(null);
    await carregarParceiros();
  };

  async function confirmarExclusao() {
    if (!excluirAlvo) return;
    try {
      await excluirParceiro(excluirAlvo.id);
      setExcluirAlvo(null);
      setToast('Parceiro excluído com sucesso.');
      await carregarParceiros();
    } catch (error) {
      console.error('Erro ao excluir parceiro:', error);
      setErro('Erro ao excluir o parceiro.');
      setExcluirAlvo(null);
    }
  }

  const parceirosFiltrados = parceiros.filter((p) => {
    const termoBusca = busca.toLowerCase();
    const matchBusca =
      !busca ||
      p.nome?.toLowerCase().includes(termoBusca) ||
      p.cpfCnpj?.replace(/\D/g, '').includes(busca.replace(/\D/g, '')) ||
      p.tipo?.toLowerCase().includes(termoBusca);

    const matchStatus =
      filtroStatus === 'todos' || p.status === filtroStatus;

    return matchBusca && matchStatus;
  });

  return (
    <PageShell
      title="Parceiros e Fornecedores"
      subtitle="Cadastro e gestão de parceiros e fornecedores da instituição"
      action={
        <button
          type="button"
          className="btn btn-success"
          onClick={() => {
            setParceiroParaEditar(null);
            setMostrarFormulario(true);
          }}
        >
          + Cadastrar Parceiro
        </button>
      }
    >
      <FeedbackAlert message={erro} variant="danger" />

      {mostrarFormulario ? (
        <div className="card shadow-sm">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              {parceiroParaEditar ? 'Editar Parceiro' : 'Cadastrar Parceiro'}
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Fechar"
              onClick={() => {
                setMostrarFormulario(false);
                setParceiroParaEditar(null);
              }}
            />
          </div>
          <div className="card-body">
            <FormularioParceiro
              parceiroParaEditar={parceiroParaEditar}
              onSalvar={handleSalvar}
              onCancelar={() => {
                setMostrarFormulario(false);
                setParceiroParaEditar(null);
              }}
              onFeedback={(message, type) => {
                if (type === 'error') setErro(message);
                else setToast(message);
              }}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="d-flex flex-wrap gap-2 mb-4">
            <input
              type="search"
              className="form-control"
              style={{ maxWidth: 320 }}
              placeholder="Buscar por nome, CPF/CNPJ ou tipo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <select
              className="form-select"
              style={{ maxWidth: 180 }}
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              <option value="todos">Todos os status</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>

          <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
            {loading ? (
              <div className="col-12">
                <div className="alert alert-secondary mb-0">
                  Carregando parceiros...
                </div>
              </div>
            ) : parceirosFiltrados.length > 0 ? (
              parceirosFiltrados.map((parceiro) => (
                <div key={parceiro.id} className="col">
                  <CardParceiro
                    parceiro={parceiro}
                    onEditar={(p) => {
                      setParceiroParaEditar(p);
                      setMostrarFormulario(true);
                    }}
                    onExcluir={(p) =>
                      setExcluirAlvo({ id: p.id, nome: p.nome })
                    }
                  />
                </div>
              ))
            ) : (
              <div className="col-12">
                <div className="alert alert-warning mb-0">
                  Nenhum parceiro encontrado.
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <ConfirmModal
        show={!!excluirAlvo}
        nome={excluirAlvo?.nome}
        onConfirm={confirmarExclusao}
        onCancel={() => setExcluirAlvo(null)}
      />

      <Toast message={toast} type="success" />
    </PageShell>
  );
}
