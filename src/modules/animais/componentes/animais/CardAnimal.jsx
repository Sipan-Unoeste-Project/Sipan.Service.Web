const CardAnimal = ({ animal, onAbrir }) => {
  const statusBadgeClass = () => {
    const status = animal.status?.toLowerCase();
    if (status?.includes("indis")) return "bg-secondary";
    if (status?.includes("dispon")) return "bg-success";
    if (status?.includes("adota")) return "bg-warning text-dark";
    return "bg-info text-dark";
  };

  return (
    <div className="card shadow-sm border-0">
      {animal.foto ? (
        <img
          src={animal.foto}
          alt={animal.nome}
          className="card-img-top"
          style={{ height: 280, objectFit: "cover" }}
        />
      ) : (
        <div
          className="d-flex align-items-center justify-content-center bg-light border-bottom"
          style={{ height: 280 }}
        >
          <span className="text-muted">Sem foto</span>
        </div>
      )}

      <div className="card-body text-center">
        <h3 className="card-title h5 mb-2">
          {animal.nome}{" "}
          <span className="fs-5 text-muted">
            {animal.sexo === "Macho" ? "♂" : "♀"}
          </span>
        </h3>

        <p className="card-text text-muted mb-4">
          <strong>Status:</strong>{" "}
          <span className={`badge rounded-pill ${statusBadgeClass()}`}>
            {animal.status}
          </span>
        </p>

        <button
          type="button"
          className="btn btn-outline-success btn-sm"
          onClick={() => onAbrir(animal)}
        >
          Saiba mais...
        </button>
      </div>
    </div>
  );
};

export default CardAnimal;
