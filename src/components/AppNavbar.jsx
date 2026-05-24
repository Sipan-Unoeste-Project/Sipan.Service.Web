import { NavLink } from 'react-router-dom';

const linkClass = ({ isActive }) =>
  `nav-link px-2 px-lg-3 ${isActive ? 'active fw-semibold' : ''}`;

export default function AppNavbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success shadow-sm">
      <div className="container-fluid">
        <NavLink className="navbar-brand fw-bold fs-5" to="/">
          SIPAN
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navContent"
          aria-controls="navContent"
          aria-expanded="false"
          aria-label="Alternar navegação"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navContent">
          <ul className="navbar-nav me-auto gap-1 flex-wrap">
            <li className="nav-item">
              <NavLink end to="/" className={linkClass}>
                Início
              </NavLink>
            </li>

            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle px-2 px-lg-3"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                onClick={(e) => e.preventDefault()}
              >
                Cadastros
              </a>
              <ul className="dropdown-menu">
                <li>
                  <NavLink className="dropdown-item" to="/pessoas">
                    Pessoas
                  </NavLink>
                </li>
                <li>
                  <NavLink className="dropdown-item" to="/animais">
                    Animais
                  </NavLink>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <NavLink className="dropdown-item" to="/usuarios">
                    Usuários do sistema
                  </NavLink>
                </li>
                <li>
                  <NavLink className="dropdown-item" to="/funcionarios">
                    Funcionários
                  </NavLink>
                </li>
              </ul>
            </li>

            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle px-2 px-lg-3"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                onClick={(e) => e.preventDefault()}
              >
                APAC
              </a>
              <ul className="dropdown-menu">
                <li>
                  <NavLink className="dropdown-item" to="/apac">
                    Painel APAC
                  </NavLink>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <NavLink className="dropdown-item" to="/apac/doacao">
                    Doações
                  </NavLink>
                </li>
                <li>
                  <NavLink className="dropdown-item" to="/apac/campanhas">
                    Campanhas
                  </NavLink>
                </li>
                <li>
                  <NavLink className="dropdown-item" to="/apac/estoque">
                    Estoque
                  </NavLink>
                </li>
                <li>
                  <NavLink className="dropdown-item" to="/apac/financeiro">
                    Financeiro
                  </NavLink>
                </li>
                <li>
                  <NavLink className="dropdown-item" to="/apac/despesas">
                    Despesas
                  </NavLink>
                </li>
                <li>
                  <NavLink className="dropdown-item" to="/apac/saude">
                    Saúde animal
                  </NavLink>
                </li>
                <li>
                  <NavLink className="dropdown-item" to="/apac/balancete">
                    Balancete
                  </NavLink>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
