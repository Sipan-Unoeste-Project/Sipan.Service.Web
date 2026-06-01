/**
 * Modal de confirmação (Bootstrap, controlado por `show`).
 *
 * @param {{
 *   show: boolean,
 *   title?: string,
 *   message?: React.ReactNode,
 *   nome?: string,
 *   confirmLabel?: string,
 *   onConfirm: Function,
 *   onCancel: Function,
 * }} props
 */
export default function ConfirmModal({
  show,
  title = 'Confirmar exclusão',
  message,
  nome,
  confirmLabel = 'Excluir',
  onConfirm,
  onCancel,
}) {
  if (!show) return null;

  const body =
    message ??
    (nome ? (
      <>
        Tem certeza que deseja excluir <strong>{nome}</strong>? Esta ação não pode ser desfeita.
      </>
    ) : (
      'Tem certeza que deseja continuar? Esta ação não pode ser desfeita.'
    ));

  return (
    <>
      <div
        className="modal-backdrop fade show"
        onClick={onCancel}
        style={{ zIndex: 1040 }}
        role="presentation"
      />
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        style={{ zIndex: 1050 }}
      >
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onCancel}
                aria-label="Fechar"
              />
            </div>
            <div className="modal-body">
              <p className="mb-0">{body}</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
                Cancelar
              </button>
              <button type="button" className="btn btn-danger" onClick={onConfirm}>
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
