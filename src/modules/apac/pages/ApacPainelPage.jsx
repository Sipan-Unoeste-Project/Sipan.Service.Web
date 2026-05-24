import { Link } from 'react-router-dom';
import PageShell from '../../../components/PageShell';

const links = [
  { to: '/apac/doacao', title: 'Doações', desc: 'Registrar doações em dinheiro ou produtos' },
  { to: '/apac/campanhas', title: 'Campanhas', desc: 'Eventos e metas de arrecadação' },
  { to: '/apac/estoque', title: 'Estoque', desc: 'Produtos, medicamentos e insumos' },
  { to: '/apac/financeiro', title: 'Financeiro', desc: 'Entradas e saídas de caixa' },
  { to: '/apac/despesas', title: 'Despesas', desc: 'Categorias e gastos do abrigo' },
  { to: '/apac/saude', title: 'Saúde animal', desc: 'Histórico veterinário dos animais' },
  { to: '/apac/balancete', title: 'Balancete', desc: 'Relatório financeiro consolidado' },
];

export default function ApacPainelPage() {
  return (
    <PageShell
      title="APAC"
      subtitle="Associação Protetora de Animais de Cananéia — gestão integrada"
    >
      <div className="row g-3">
        {links.map((item) => (
          <div className="col-sm-6 col-lg-4" key={item.to}>
            <Link to={item.to} className="text-decoration-none text-body">
              <div className="card h-100 border-0 shadow-sm home-card">
                <div className="card-body">
                  <h5 className="fw-semibold mb-2">{item.title}</h5>
                  <p className="text-muted small mb-0">{item.desc}</p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
