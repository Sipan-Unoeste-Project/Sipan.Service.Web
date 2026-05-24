import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success shadow-sm">
      <div className="container">
        <NavLink className="navbar-brand fw-bold fs-5" to="/pessoas">
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
          <ul className="navbar-nav ms-auto gap-1">
            <li className="nav-item">
              <NavLink
                end
                to="/pessoas"
                className={({ isActive }) =>
                  `nav-link px-3 ${isActive ? 'active fw-semibold' : ''}`
                }
              >
                Pessoas
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/pessoas/nova"
                className={({ isActive }) =>
                  `nav-link px-3 ${isActive ? 'active fw-semibold' : ''}`
                }
              >
                + Nova Pessoa
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
