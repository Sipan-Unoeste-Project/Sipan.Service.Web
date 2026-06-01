/**
 * Cards de estatísticas simples (total, contadores).
 * @param {{ items: Array<{ label: string, value: number|string }> }} props
 */
export default function SimpleStatsRow({ items }) {
  return (
    <div className="row g-3 mb-4">
      {items.map((item) => (
        <div className="col-md-4" key={item.label}>
          <div className="card border-0 shadow-sm text-center h-100">
            <div className="card-body py-3">
              <p className="text-muted small mb-1">{item.label}</p>
              <p className="fs-3 fw-bold mb-0">{item.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
