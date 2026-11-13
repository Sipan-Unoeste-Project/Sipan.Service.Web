import { useEffect, useRef, useState } from 'react';

export default function DoacaoValorModal({
  show,
  campanhaNome,
  onConfirm,
  onCancel,
}) {
  const [valor, setValor] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (show) {
      setValor('');
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [show]);

  if (!show) return null;

  function handleSubmit(e) {
    e.preventDefault();
    onConfirm(valor);
  }

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
        style={{
          zIndex: 1050,
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          width: '100%',
          height: '100%',
          margin: 0,
        }}
      >
        <div
          className="modal-dialog modal-dialog-centered"
          style={{ margin: '0 auto', width: '100%', maxWidth: '420px' }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="modal-content border-0 shadow">
            <div
              className="modal-header text-white"
              style={{ backgroundColor: '#16744a' }}
            >
              <h5 className="modal-title fw-semibold mb-0">Registrar doação</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onCancel}
                aria-label="Fechar"
              />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {campanhaNome ? (
                  <p className="text-muted small mb-3">
                    Campanha: <strong className="text-body">{campanhaNome}</strong>
                  </p>
                ) : null}
                <label htmlFor="doacao-valor" className="form-label fw-semibold">
                  Valor da doação (R$)
                </label>
                <input
                  ref={inputRef}
                  id="doacao-valor"
                  type="text"
                  inputMode="decimal"
                  className="form-control"
                  placeholder="Ex.: 50,00"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={onCancel}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-success">
                  Confirmar doação
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
