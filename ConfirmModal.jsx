/**
 * Modal de confirmação para exclusão de uma pessoa.
 * Usa o padrão visual do projeto (modal-overlay + modal-sm).
 *
 * @param {{ show: boolean, nome: string, onConfirm: Function, onCancel: Function }} props
 */
export default function ConfirmModal({ show, nome, onConfirm, onCancel }) {
  if (!show) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onCancel}
      style={{ zIndex: 1050 }}
      role="presentation"
    >
      <div
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-dialog-header">
          <h2 id="confirm-delete-title">Confirmar exclusão</h2>
          <button
            type="button"
            className="confirm-dialog-close"
            onClick={onCancel}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className="confirm-dialog-body">
          Tem certeza que deseja excluir <strong>{nome}</strong>? Esta ação não
          pode ser desfeita.
        </div>

        <div className="confirm-dialog-footer">
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="btn btn-danger btn-sm" onClick={onConfirm}>
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
