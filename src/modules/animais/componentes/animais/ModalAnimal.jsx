export default function ModalAnimal({ animal, onFechar, onEditar, onRequestExcluir }) {
  if (!animal) return null;

  return (
    <>
      <div
        className="modal-backdrop fade show"
        onClick={onFechar}
        style={{ zIndex: 1040 }}
        role="presentation"
      />
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        style={{ zIndex: 1050 }}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{animal.nome}</h5>
              <button type="button" className="btn-close" aria-label="Fechar" onClick={onFechar} />
            </div>
            <div className="modal-body">
              <div className="row g-4">
                <div className="col-12 col-md-5">
                  {animal.foto ? (
                    <img
                      src={animal.foto}
                      alt={animal.nome}
                      className="img-fluid rounded w-100"
                      style={{ objectFit: 'cover', maxHeight: 340 }}
                    />
                  ) : (
                    <div
                      className="d-flex align-items-center justify-content-center bg-light rounded border"
                      style={{ minHeight: 280 }}
                    >
                      <span className="text-muted">Sem foto</span>
                    </div>
                  )}
                </div>
                <div className="col-12 col-md-7">
                  <p className="mb-2">
                    <strong>Espécie:</strong> {animal.especie}
                  </p>
                  <p className="mb-2">
                    <strong>Raça:</strong> {animal.raca}
                  </p>
                  <p className="mb-2">
                    <strong>Sexo:</strong> {animal.sexo}
                  </p>
                  <p className="mb-2">
                    <strong>Porte:</strong> {animal.porte}
                  </p>
                  <p className="mb-2">
                    <strong>Status:</strong> {animal.status}
                  </p>
                  <p className="mb-2">
                    <strong>Vacinas:</strong> {animal.vacinas || 'Não informado'}
                  </p>
                  <p className="mb-0">
                    <strong>Data cadastro:</strong>{' '}
                    {animal.dataCadastro
                      ? new Date(animal.dataCadastro).toLocaleDateString('pt-BR')
                      : '—'}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <h6>Sobre</h6>
                <p className="mb-0">{animal.sobre || 'Sem descrição'}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={() => onRequestExcluir(animal)}
              >
                Excluir
              </button>
              <button type="button" className="btn btn-success" onClick={() => onEditar(animal)}>
                Editar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
