import { NavLink } from 'react-router-dom';
import { useNavSearch } from '../context/NavSearchContext';
import { menuOptionsFromFilter } from '../data/navOptions';

const MENU_SECTIONS = [
  { title: 'Público', menu: 'public' },
  { title: 'Administrativo', menu: 'admin' },
];

export default function Menu() {
  const { opcoesFiltradas, buscaAtiva } = useNavSearch();

  return (
    <aside className="menu-panel">
      <nav className="menu-nav">
        {MENU_SECTIONS.map((section) => {
          const items = menuOptionsFromFilter(opcoesFiltradas, section.menu);
          if (buscaAtiva && items.length === 0) return null;

          return (
            <div key={section.title} className="menu-section">
              <div className="menu-section-title">{section.title}</div>

              {items.map((item) => (
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
          );
        })}

        {buscaAtiva && opcoesFiltradas.length === 0 && (
          <p className="text-muted small px-2 mb-0">Nenhuma opção no menu.</p>
        )}
      </nav>
    </aside>
  );
}
