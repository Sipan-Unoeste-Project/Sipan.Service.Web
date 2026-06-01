import { useState, useEffect, useCallback } from 'react';
import PageShell from '../../../components/PageShell';
import ConfirmModal from '../../../components/ConfirmModal';
import FeedbackAlert from '../../../components/FeedbackAlert';
import Toast from '../../../components/Toast';
import { useTimedMessage } from '../../../hooks/useTimedMessage';
import CardAnimal from '../componentes/animais/CardAnimal';
import FormularioAnimal from '../componentes/animais/FormularioAnimal';
import ModalAnimal from '../componentes/animais/ModalAnimal';
import { listarAnimais, excluirAnimal } from '../utils/storageAnimais';

export default function PaginaAnimais() {
  const [animais, setAnimais] = useState([]);
  const [animalParaEditar, setAnimalParaEditar] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [busca, setBusca] = useState('');
  const [animalSelecionado, setAnimalSelecionado] = useState(null);
  const [excluirAlvo, setExcluirAlvo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useTimedMessage(3500);
  const [erro, setErro] = useTimedMessage(6000);

  const carregarAnimais = useCallback(async () => {
    setLoading(true);
    try {
      const lista = await listarAnimais();
      setAnimais(lista);
    } catch (error) {
      console.error('Erro ao carregar animais:', error);
      setErro('Não foi possível carregar a lista de animais. Verifique se a API está em execução.');
    } finally {
      setLoading(false);
    }
  }, [setErro]);

  useEffect(() => {
    carregarAnimais();
  }, [carregarAnimais]);

  const handleSalvar = async () => {
    setMostrarFormulario(false);
    setAnimalParaEditar(null);
    await carregarAnimais();
  };

  async function confirmarExclusao() {
    if (!excluirAlvo) return;
    try {
      await excluirAnimal(excluirAlvo.id);
      setAnimalSelecionado(null);
      setExcluirAlvo(null);
      setToast('Animal excluído com sucesso.');
      await carregarAnimais();
    } catch (error) {
      console.error('Erro ao excluir animal:', error);
      setErro('Erro ao excluir o animal.');
      setExcluirAlvo(null);
    }
  }

  const animaisFiltrados = animais.filter(
    (animal) =>
      animal.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      animal.especie?.toLowerCase().includes(busca.toLowerCase()) ||
      animal.raca?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <PageShell
      title="Animais"
      subtitle="Cadastro e acompanhamento dos animais do abrigo"
      action={
        <button
          type="button"
          className="btn btn-success"
          onClick={() => {
            setAnimalParaEditar(null);
            setMostrarFormulario(true);
          }}
        >
          + Cadastrar Animal
        </button>
      }
    >
      <FeedbackAlert message={erro} variant="danger" />

      <div className="mb-4">
        <input
          type="search"
          className="form-control"
          style={{ maxWidth: 320 }}
          placeholder="Buscar por nome, espécie ou raça..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
        {loading ? (
          <div className="col-12">
            <div className="alert alert-secondary mb-0">Carregando animais...</div>
          </div>
        ) : animaisFiltrados.length > 0 ? (
          animaisFiltrados.map((animal) => (
            <div key={animal.id} className="col">
              <CardAnimal animal={animal} onAbrir={setAnimalSelecionado} />
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="alert alert-warning mb-0">Nenhum animal encontrado.</div>
          </div>
        )}
      </div>

      <ModalAnimal
        animal={animalSelecionado}
        onFechar={() => setAnimalSelecionado(null)}
        onEditar={(animal) => {
          setAnimalSelecionado(null);
          setAnimalParaEditar(animal);
          setMostrarFormulario(true);
        }}
        onRequestExcluir={(animal) => {
          setExcluirAlvo({ id: animal.id, nome: animal.nome });
        }}
      />

      {mostrarFormulario && (
        <div
          className="modal-backdrop fade show d-block"
          style={{ zIndex: 1040 }}
          onClick={() => {
            setMostrarFormulario(false);
            setAnimalParaEditar(null);
          }}
          role="presentation"
        />
      )}

      {mostrarFormulario && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ zIndex: 1050 }}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {animalParaEditar ? 'Editar Animal' : 'Cadastrar Animal'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Fechar"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setAnimalParaEditar(null);
                  }}
                />
              </div>
              <div className="modal-body">
                <FormularioAnimal
                  animalParaEditar={animalParaEditar}
                  onSalvar={handleSalvar}
                  onCancelar={() => {
                    setMostrarFormulario(false);
                    setAnimalParaEditar(null);
                  }}
                  onFeedback={(message, type) => {
                    if (type === 'error') setErro(message);
                    else setToast(message);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
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
