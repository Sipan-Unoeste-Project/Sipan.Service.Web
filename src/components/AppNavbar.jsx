import { NavLink } from 'react-router-dom';

export default function AppNavbar() {
  return (
    <nav className="navbar navbar-light shadow-sm" style={{ backgroundColor: '#16744a' }}>
      <div className="container d-flex align-items-center justify-content-between px-3">
        <NavLink className="navbar-brand fw-bold fs-5 d-flex align-items-center gap-2 text-white" to="/">
          <img 
            src="/logo-apac.png" 
            alt="Logo APAC" 
            style={{ height: 40 }}
            className="me-2"
          />
        </NavLink>

        <form className="d-flex flex-fill justify-content-center mx-3" role="search" style={{ maxWidth: 520 }}>
          <input
            className="form-control form-control-sm"
            type="search"
            placeholder="Pesquisar..."
            aria-label="Pesquisar"
            style={{ minWidth: 220 }}
          />
        </form>

        <button className="btn" style={{ color: 'white', fontSize: '1.5rem' }} title="Login">
          👤
        </button>
      </div>
    </nav>
  );
}
