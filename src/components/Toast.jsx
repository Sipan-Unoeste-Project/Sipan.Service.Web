/**
 * Notificação temporária no canto inferior direito.
 *
 * @param {{ message: string, type: 'success'|'danger'|'warning' }} props
 */
export default function Toast({ message, type = 'success' }) {
  if (!message) return null;

  const bgClass = {
    success: 'bg-success',
    danger: 'bg-danger',
    warning: 'bg-warning text-dark',
  }[type] ?? 'bg-success';

  return (
    <div
      className="position-fixed bottom-0 end-0 p-3"
      style={{ zIndex: 9999 }}
      aria-live="polite"
    >
      <div className={`toast show text-white ${bgClass}`} role="alert">
        <div className="toast-body fw-medium d-flex align-items-center gap-2">
          {type === 'success' && (
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
              <path d="M3 8l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {message}
        </div>
      </div>
    </div>
  );
}
