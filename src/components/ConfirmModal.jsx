/**
 * Modal de confirmação para exclusão de uma pessoa.
 * Controlado via prop `show` (React state, sem Bootstrap JS).
 *
 * @param {{ show: boolean, nome: string, onConfirm: Function, onCancel: Function }} props
 */
export default function ConfirmModal({ show, nome, onConfirm, onCancel }) {
  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        onClick={onCancel}
        style={{ zIndex: 1040 }}
      />

      {/* Modal */}
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        style={{ zIndex: 1050 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Confirmar Exclusão</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onCancel}
                aria-label="Fechar"
              />
            </div>
            <div className="modal-body">
              <p className="mb-0">
                Tem certeza que deseja excluir{' '}
                <strong>{nome}</strong>? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onCancel}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={onConfirm}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
