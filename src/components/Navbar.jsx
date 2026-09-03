import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const linkClass = ({ isActive }) =>
  `nav-link px-2 px-lg-3 ${isActive ? 'active fw-semibold' : ''}`;

export default function Navbar() {
  const { autenticado } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar navbar-expand-lg navbar-light shadow-sm" style={{ backgroundColor: '#16744a' }}>
      <div className="container">
        <NavLink className="navbar-brand fw-bold fs-5" to="/">
          <img 
            src="/logo-apac.png" 
            alt="Logo APAC" 
            style={{ height: 40 }}
            className="me-2"
          />
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navPublicContent"
          aria-controls="navPublicContent"
          aria-expanded="false"
          aria-label="Alternar navegação"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navPublicContent">
          <ul className="navbar-nav me-auto gap-1">
            <li className="nav-item">
              <NavLink end to="/" className={linkClass} style={{ color: 'white' }}>
                Quem somos
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/publico/animais" className={linkClass} style={{ color: 'white' }}>
                Animais
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/publico/doacoes" className={linkClass} style={{ color: 'white' }}>
                Doações
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/publico/campanhas" className={linkClass} style={{ color: 'white' }}>
                Campanhas
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/publico/contato" className={linkClass} style={{ color: 'white' }}>
                Contato
              </NavLink>
            </li>
          </ul>

          <form className="d-flex me-3" role="search">
            <input
              className="form-control form-control-sm me-2"
              type="search"
              placeholder="Pesquisar..."
              aria-label="Pesquisar"
              style={{ maxWidth: 200 }}
            />
          </form>

          <button
            type="button"
            className="btn btn-light btn-sm"
            onClick={() => navigate(autenticado ? '/inicio' : '/login')}
          >
            {autenticado ? 'Área interna' : 'Entrar'}
          </button>
        </div>
      </div>
    </nav>
  );
}
