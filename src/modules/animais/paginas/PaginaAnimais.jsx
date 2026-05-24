import { useState, useEffect } from 'react';
import PageShell from '../../../components/PageShell';
import CardAnimal from '../componentes/animais/CardAnimal';
import FormularioAnimal from '../componentes/animais/FormularioAnimal';
import ModalAnimal from '../componentes/animais/ModalAnimal.jsx';
import { listarAnimais, excluirAnimal } from '../utils/storageAnimais';
import './PaginaAnimais.css';

const PaginaAnimais = () => {
  const [animais, setAnimais] = useState([]);
  const [animalParaEditar, setAnimalParaEditar] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [busca, setBusca] = useState('');
  const [animalSelecionado, setAnimalSelecionado] = useState(null);

  const carregarAnimais = () => {
    setAnimais(listarAnimais());
  };

  useEffect(() => {
    carregarAnimais();
  }, []);

  const handleSalvar = () => {
    setMostrarFormulario(false);
    setAnimalParaEditar(null);
    carregarAnimais();
  };

  const abrirCadastro = () => {
    setAnimalParaEditar(null);
    setMostrarFormulario(true);
  };

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
        <button type="button" className="btn btn-success" onClick={abrirCadastro}>
          + Cadastrar Animal
        </button>
      }
    >
      <div className="mb-4">
        <input
          type="search"
          className="form-control"
          style={{ maxWidth: 400 }}
          placeholder="Buscar por nome, espécie ou raça..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div className="cards-grid">
        {animaisFiltrados.length > 0 ? (
          animaisFiltrados.map((animal) => (
            <CardAnimal key={animal.id} animal={animal} onAbrir={setAnimalSelecionado} />
          ))
        ) : (
          <p className="sem-resultados text-muted">Nenhum animal encontrado.</p>
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
        onExcluir={(id) => {
          excluirAnimal(id);
          carregarAnimais();
        }}
      />

      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal-content">
            <FormularioAnimal animalParaEditar={animalParaEditar} onSalvar={handleSalvar} />
            <button
              type="button"
              className="btn btn-secondary btn-sm modal-fechar"
              onClick={() => {
                setMostrarFormulario(false);
                setAnimalParaEditar(null);
              }}
              aria-label="Fechar"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default PaginaAnimais;
