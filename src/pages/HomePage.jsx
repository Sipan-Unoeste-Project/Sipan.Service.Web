import { Link } from 'react-router-dom';

const cadastros = [
  { to: '/pessoas', title: 'Pessoas', desc: 'Doadores, adotantes e voluntários' },
  { to: '/animais', title: 'Animais', desc: 'Cadastro e acompanhamento dos animais' },
  { to: '/usuarios', title: 'Usuários', desc: 'Acesso ao sistema e permissões' },
  { to: '/funcionarios', title: 'Funcionários', desc: 'Equipe e cargos do abrigo' },
];

const apac = [
  { to: '/apac', title: 'Painel APAC', desc: 'Visão geral do módulo' },
  { to: '/apac/doacao', title: 'Doações', desc: 'Dinheiro, PIX e produtos' },
  { to: '/apac/campanhas', title: 'Campanhas', desc: 'Eventos e metas' },
  { to: '/apac/estoque', title: 'Estoque', desc: 'Produtos e insumos' },
  { to: '/apac/financeiro', title: 'Financeiro', desc: 'Entradas e saídas' },
  { to: '/apac/despesas', title: 'Despesas', desc: 'Controle de gastos' },
  { to: '/apac/saude', title: 'Saúde animal', desc: 'Histórico veterinário' },
  { to: '/apac/balancete', title: 'Balancete', desc: 'Relatório consolidado' },
];

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
  return (
    <div className="container py-4">
      <div className="mb-4">
        <h1 className="fw-bold mb-1">Início</h1>
        <p className="text-muted mb-0">
          Sistema Integrado de Proteção Animal — escolha uma área abaixo.
        </p>
      </div>

      <section className="mb-5">
        <h2 className="h5 text-muted text-uppercase mb-3">Cadastros</h2>
        <div className="row g-3">
          {cadastros.map((item) => (
            <SectionCard key={item.to} {...item} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="h5 text-muted text-uppercase mb-3">APAC</h2>
        <div className="row g-3">
          {apac.map((item) => (
            <SectionCard key={item.to} {...item} />
          ))}
        </div>
      </section>
    </div>
  );
}
