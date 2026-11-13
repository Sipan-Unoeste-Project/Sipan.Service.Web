/**
 * Botões padrão de ação: lápis (editar) e lixeira (excluir).
 * Passe só onEdit, só onDelete, ou os dois.
 */
export default function ActionIconButtons({ onEdit, onDelete, className = '' }) {
  if (!onEdit && !onDelete) return null;

  return (
    <div className={`d-inline-flex flex-wrap gap-1 ${className}`.trim()}>
      {onEdit ? (
        <button
          type="button"
          className="btn btn-sm btn-outline-success"
          title="Editar"
          aria-label="Editar"
          onClick={onEdit}
        >
          <i className="bi bi-pencil" aria-hidden="true" />
        </button>
      ) : null}
      {onDelete ? (
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          title="Excluir"
          aria-label="Excluir"
          onClick={onDelete}
        >
          <i className="bi bi-trash" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
