export default function StatRow({ items }) {
  return (
    <div className="row g-3 mb-4">
      {items.map((item) => (
        <div className={`col-md-${12 / Math.min(items.length, 4)}`} key={item.label}>
          <div className={`card border-0 shadow-sm h-100 ${item.className || ''}`}>
            <div className="card-body py-3">
              <p className="text-muted small mb-1">{item.label}</p>
              <p className={`fs-4 fw-bold mb-0 ${item.valueClass || ''}`}>{item.value}</p>
              {item.sub && <p className="text-muted small mb-0 mt-1">{item.sub}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
