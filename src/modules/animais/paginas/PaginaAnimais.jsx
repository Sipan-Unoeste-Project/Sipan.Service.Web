import { useState, useEffect, useCallback } from "react";
import CardAnimal from "../componentes/animais/CardAnimal";
import FormularioAnimal from "../componentes/animais/FormularioAnimal";
import ModalAnimal from "../componentes/animais/ModalAnimal.jsx";
import { listarAnimais, excluirAnimal } from "../utils/storageAnimais";

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

    const animaisFiltrados = animais.filter((animal) =>
        animal.nome?.toLowerCase().includes(busca.toLowerCase()) ||
        animal.especie?.toLowerCase().includes(busca.toLowerCase()) ||
        animal.raca?.toLowerCase().includes(busca.toLowerCase())
    );

    return (
        <div className="container-fluid py-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
                <h1 className="h2 mb-0">Animais</h1>

                <button
                    className="btn btn-success"
                    onClick={() => {
                        setAnimalParaEditar(null);
                        setMostrarFormulario(true);
                    }}
                >
                    Cadastrar Animal
                </button>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Buscar ..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="form-control form-control-lg"
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
                onExcluir={handleExcluir}
            />

            {mostrarFormulario && (
                <div
                    className="d-flex justify-content-center"
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0, 0, 0, 0.65)",
                        zIndex: 1050,
                        padding: "1rem",
                        overflowY: "auto",
                    }}
                    onClick={() => {
                        setMostrarFormulario(false);
                        setAnimalParaEditar(null);
                    }}
                >
                    <div
                        className="card shadow-lg w-100 mx-3"
                        style={{
                            maxWidth: 900,
                            maxHeight: "90vh",
                            overflowY: "auto",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="card-body position-relative">
                            <button
                                type="button"
                                className="btn-close position-absolute top-0 end-0 m-3"
                                aria-label="Fechar"
                                onClick={() => {
                                    setMostrarFormulario(false);
                                    setAnimalParaEditar(null);
                                }}
                            />

                            <FormularioAnimal
                                animalParaEditar={animalParaEditar}
                                onSalvar={handleSalvar}
                                onCancelar={() => {
                                    setMostrarFormulario(false);
                                    setAnimalParaEditar(null);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaginaAnimais;
