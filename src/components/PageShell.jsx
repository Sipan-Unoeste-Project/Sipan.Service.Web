/**
 * Estrutura padrão das telas internas: título, descrição e área de ação.
 */
export default function PageShell({ title, subtitle, action, children }) {
  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">{title}</h2>
          {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
