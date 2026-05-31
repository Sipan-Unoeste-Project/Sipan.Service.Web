const ModalAnimal = ({
    animal,
    onFechar,
    onEditar,
    onExcluir
}) => {
    if (!animal) return null;

    return (
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
        >
            <div
                className="card shadow-lg w-100 mx-3"
                style={{
                    maxWidth: 900,
                    height: "fit-content",
                }}
            >
                <div className="card-body position-relative">
                    <button
                        type="button"
                        className="btn-close position-absolute top-0 end-0 m-3"
                        aria-label="Fechar"
                        onClick={onFechar}
                    />

                    <div className="row g-4">
                        <div className="col-12 col-md-5">
                            {animal.foto ? (
                                <img
                                    src={animal.foto}
                                    alt={animal.nome}
                                    className="img-fluid rounded-4 w-100"
                                    style={{ objectFit: "cover", maxHeight: 340 }}
                                />
                            ) : (
                                <div className="d-flex align-items-center justify-content-center bg-light rounded-4 border" style={{ minHeight: 320 }}>
                                    <span className="text-muted">Sem foto</span>
                                </div>
                            )}
                        </div>

                        <div className="col-12 col-md-7">
                            <h2 className="h4">{animal.nome}</h2>
                            <p className="mb-2"><strong>Espécie:</strong> {animal.especie}</p>
                            <p className="mb-2"><strong>Raça:</strong> {animal.raca}</p>
                            <p className="mb-2"><strong>Sexo:</strong> {animal.sexo}</p>
                            <p className="mb-2"><strong>Porte:</strong> {animal.porte}</p>
                            <p className="mb-2"><strong>Status:</strong> {animal.status}</p>
                            <p className="mb-2"><strong>Vacinas:</strong> {animal.vacinas || "Não informado"}</p>
                            <p className="mb-0"><strong>Data cadastro:</strong> {new Date(animal.dataCadastro).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <h5>Sobre</h5>
                        <p className="mb-0">{animal.sobre || "Sem descrição"}</p>
                    </div>

                    <div className="d-flex flex-column flex-sm-row justify-content-between gap-2 mt-4">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => {
                                if (window.confirm(`Tem certeza que deseja excluir ${animal.nome}?`)) {
                                    onExcluir(animal.id);
                                    onFechar();
                                }
                            }}
                        >
                            Excluir
                        </button>

                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={() => onEditar(animal)}
                        >
                            Editar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalAnimal;
