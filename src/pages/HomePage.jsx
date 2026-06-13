import { Link } from 'react-router-dom';
import { useNavSearch } from '../context/NavSearchContext';
import { homeSectionsFromOptions } from '../data/navOptions';

function SectionCard({ to, title, desc }) {
  return (
    <div className="col-sm-6 col-lg-3">
      <Link to={to} className="text-decoration-none text-body">
        <div className="card h-100 border-0 shadow-sm home-card">
          <div className="card-body">
            <h5 className="card-title fw-semibold mb-2">{title}</h5>
            <p className="card-text text-muted small mb-0">{desc}</p>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function HomePage() {
  const { opcoesFiltradas, buscaAtiva, termo } = useNavSearch();
  const { cadastros, apac } = homeSectionsFromOptions(opcoesFiltradas);
  const nenhumResultado = buscaAtiva && cadastros.length === 0 && apac.length === 0;

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h1 className="fw-bold mb-1">Início</h1>
        <p className="text-muted mb-0">
          {buscaAtiva
            ? `Opções encontradas para “${termo.trim()}”.`
            : 'Sistema Integrado de Proteção Animal — escolha uma área abaixo.'}
        </p>
      </div>

      {nenhumResultado ? (
        <div className="alert alert-light border text-muted mb-0">
          Nenhuma opção corresponde à busca. Clique no ✕ para voltar ao início.
        </div>
      ) : (
        <>
          {cadastros.length > 0 && (
            <section className="mb-5">
              <h2 className="h5 text-muted text-uppercase mb-3">Cadastros</h2>
              <div className="row g-3">
                {cadastros.map((item) => (
                  <SectionCard
                    key={item.to}
                    to={item.to}
                    title={item.label}
                    desc={item.desc}
                  />
                ))}
              </div>
            </section>
          )}

          {apac.length > 0 && (
            <section>
              <h2 className="h5 text-muted text-uppercase mb-3">APAC</h2>
              <div className="row g-3">
                {apac.map((item) => (
                  <SectionCard
                    key={item.to}
                    to={item.to}
                    title={item.label}
                    desc={item.desc}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
