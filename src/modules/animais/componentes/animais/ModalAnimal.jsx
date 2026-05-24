import "./ModalAnimal.css";

const ModalAnimal = ({
    animal,
    onFechar,
    onEditar,
    onExcluir
}) => {

    if (!animal) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-animal">

                <button
                    className="botao-fechar"
                    onClick={onFechar}
                >
                    ✕
                </button>

                <div className="modal-topo">
                    <div className="modal-foto">
                        {animal.foto ? (
                            <img
                                src={animal.foto}
                                alt={animal.nome}
                            />
                        ) : (
                            <div className="sem-foto">
                                Sem foto
                            </div>
                        )}
                    </div>

                    <div className="modal-info">
                        <h2>{animal.nome}</h2>

                        <p><strong>Espécie:</strong> {animal.especie}</p>
                        <p><strong>Raça:</strong> {animal.raca}</p>
                        <p><strong>Sexo:</strong> {animal.sexo}</p>
                        <p><strong>Porte:</strong> {animal.porte}</p>
                        <p><strong>Status:</strong> {animal.status}</p>
                        <p><strong>Vacinas:</strong> {animal.vacinas || "Não informado"}</p>
                        <p><strong>Data cadastro:</strong> {new Date(animal.dataCadastro).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="modal-sobre">
                    <h3>Sobre</h3>

                    <p>{animal.sobre || "Sem descrição"}</p>
                </div>

                <div className="modal-acoes">
                    <button
                        className="botao botao-excluir"
                        onClick={() => {
                            if (window.confirm(`Tem certeza que deseja excluir ${animal.nome}?`)
                            ) {
                                onExcluir(animal.id);
                                onFechar();
                            }
                        }}
                    >
                        Excluir
                    </button>

                    <button
                        className="botao botao-editar"
                        onClick={() => onEditar(animal)}
                    >
                        Editar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalAnimal;
