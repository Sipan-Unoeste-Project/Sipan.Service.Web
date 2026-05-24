/**
 * Exibe os cards de resumo estatístico da lista de pessoas.
 * @param {{ pessoas: Array }} props
 */
export default function StatsCards({ pessoas }) {
  const total      = pessoas.length;
  const doadores   = pessoas.filter((p) => p.tipo === 'doador').length;
  const adotantes  = pessoas.filter((p) => p.tipo === 'adotante').length;
  const voluntarios = pessoas.filter((p) => p.tipo === 'voluntario').length;

  return (
    <div className="row g-3 mb-4">
      <div className="col-6 col-md-3">
        <div className="card border-0 bg-light h-100">
          <div className="card-body text-center py-3">
            <h3 className="fw-bold text-dark mb-1">{total}</h3>
            <p className="text-muted mb-0 small fw-medium">Total de Pessoas</p>
          </div>
        </div>
      </div>

      <div className="col-6 col-md-3">
        <div className="card border-top border-primary border-3 h-100">
          <div className="card-body text-center py-3">
            <h3 className="fw-bold text-primary mb-1">{doadores}</h3>
            <p className="text-muted mb-1 small fw-medium">Doadores</p>
            <span className="badge bg-primary">Doador</span>
          </div>
        </div>
      </div>

      <div className="col-6 col-md-3">
        <div className="card border-top border-purple border-3 h-100" style={{ borderColor: '#6f42c1 !important' }}>
          <div className="card-body text-center py-3">
            <h3 className="fw-bold mb-1" style={{ color: '#6f42c1' }}>{adotantes}</h3>
            <p className="text-muted mb-1 small fw-medium">Adotantes</p>
            <span className="badge" style={{ backgroundColor: '#6f42c1' }}>Adotante</span>
          </div>
        </div>
      </div>

      <div className="col-6 col-md-3">
        <div className="card border-top border-warning border-3 h-100">
          <div className="card-body text-center py-3">
            <h3 className="fw-bold text-warning mb-1">{voluntarios}</h3>
            <p className="text-muted mb-1 small fw-medium">Voluntários</p>
            <span className="badge bg-warning text-dark">Voluntário</span>
          </div>
        </div>
      </div>
    </div>
  );
}
