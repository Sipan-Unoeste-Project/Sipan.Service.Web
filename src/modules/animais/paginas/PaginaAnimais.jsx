import { useState, useEffect, useCallback } from "react";
import CardAnimal from "../componentes/animais/CardAnimal";
import FormularioAnimal from "../componentes/animais/FormularioAnimal";
import ModalAnimal from "../componentes/animais/ModalAnimal.jsx";
import { listarAnimais, excluirAnimal } from "../utils/storageAnimais";
import "./PaginaAnimais.css";

const PaginaAnimais = () => {
const [animais, setAnimais] = useState([]);
    const [animalParaEditar, setAnimalParaEditar] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [busca, setBusca] = useState("");
    const [animalSelecionado, setAnimalSelecionado] = useState(null);
    const [loading, setLoading] = useState(false);

    const carregarAnimais = useCallback(async () => {
        setLoading(true);
        try {
            const lista = await listarAnimais();
            setAnimais(lista);
        } catch (error) {
            console.error("Erro ao carregar animais:", error);
            alert("Erro ao carregar lista de animais.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        carregarAnimais();
    }, [carregarAnimais]);

    const handleSalvar = async () => {
        setMostrarFormulario(false);
        setAnimalParaEditar(null);
        await carregarAnimais(); 
    };

    const handleExcluir = async (id) => {
        try {
            await excluirAnimal(id);
            await carregarAnimais();
        } catch (error) {
            alert("Erro ao excluir o animal.");
            console.error("Erro ao excluir animal:", error.message);
        }
    };

    const animaisFiltrados = animais.filter(animal =>
        animal.nome?.toLowerCase().includes(busca.toLowerCase()) ||
        animal.especie?.toLowerCase().includes(busca.toLowerCase()) ||
        animal.raca?.toLowerCase().includes(busca.toLowerCase())
    );

    return (
        <div className="animal-container">
            <div className="animal-header">
                <h1>Animais</h1>

                <div className="animal-acoe">
                    <button
                        className="botao botao-cadastrar"
                        onClick={() => {
                            setAnimalParaEditar(null);
                            setMostrarFormulario(true);
                        }}
                    >
                        Cadastrar Animal
                    </button>
                </div>
            </div>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Buscar ..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                />
            </div>

            <div className="cards-grid">
                {loading ? (
                    <p>Carregando animais...</p>
                ) : animaisFiltrados.length > 0 ? (
                    animaisFiltrados.map(animal => (
                        <CardAnimal
                            key={animal.id}
                            animal={animal}
                            onAbrir={setAnimalSelecionado}
                        />
                    ))
                ) : (
                    <p className="sem-resultados">Nenhum animal encontrado.</p>
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
                onExcluir={handleExcluir}
            />

            {mostrarFormulario && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <FormularioAnimal
                            animalParaEditar={animalParaEditar}
                            onSalvar={handleSalvar}
                        />
                        <button
                            className="botao botao-fechar"
                            onClick={() => {
                                setMostrarFormulario(false);
                                setAnimalParaEditar(null);
                            }}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaginaAnimais;
