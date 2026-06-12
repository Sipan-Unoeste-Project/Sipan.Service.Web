/** Toggle Ativo / Inativo (Bootstrap form-switch, verde quando ativo). */
export default function StatusToggle({ id, ativo, onChange, disabled = false }) {
  return (
    <div className="form-check form-switch status-toggle mb-0">
      <input
        className="form-check-input"
        type="checkbox"
        role="switch"
        id={id}
        checked={ativo}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked ? 'Ativo' : 'Inativo')}
      />
      <label className="form-check-label small" htmlFor={id}>
        {ativo ? 'Ativo' : 'Inativo'}
      </label>
    </div>
  );
}
