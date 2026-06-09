import { NavLink } from 'react-router-dom';

const menuSections = [
  {
    items: [
      { to: '/quem-somos', label: 'Quem somos' },
      { to: '/publico/animais', label: 'Animais' },
      { to: '/publico/doacoes', label: 'Doações' },
      { to: '/publico/campanhas', label: 'Campanhas' },
      { to: '/publico/contato', label: 'Contato' },
    ],
  },
  {
    items: [
      { to: '/apac', label: 'Painel APAC' },
      { to: '/apac/estoque', label: 'Estoque' },
      { to: '/apac/financeiro', label: 'Financeiro' },
      { to: '/apac/despesas', label: 'Despesas' },
      { to: '/apac/saude', label: 'Saúde animal' },
      { to: '/apac/balancete', label: 'Balancete' },
      { to: '/usuarios', label: 'Usuários' },
      { to: '/funcionarios', label: 'Funcionários' },
    ],
  },
];

export default function Menu() {
  return (
    <aside className="menu-panel">
      <nav className="menu-nav">
        {menuSections.map((section) => (
          <div key={section.title} className="menu-section">
            <div className="menu-section-title">{section.title}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `menu-link ${isActive ? 'active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}

