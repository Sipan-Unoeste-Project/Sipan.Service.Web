import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavSearch } from '../context/NavSearchContext';

export default function AppNavbar() {
  const navigate = useNavigate();
  const { usuario, sair } = useAuth();
  const { termo, setTermo, opcoesFiltradas, limparBusca, buscaAtiva } = useNavSearch();
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const buscaRef = useRef(null);

  useEffect(() => {
    function handleClickFora(event) {
      if (buscaRef.current && !buscaRef.current.contains(event.target)) {
        setDropdownAberto(false);
      }
    }
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    if (opcoesFiltradas.length === 1) {
      navigate(opcoesFiltradas[0].to);
      setDropdownAberto(false);
      return;
    }
    if (buscaAtiva) {
      navigate('/inicio');
      setDropdownAberto(true);
    }
  }

  function selecionarOpcao(to) {
    navigate(to);
    setDropdownAberto(false);
  }

  return (
    <nav className="navbar navbar-light shadow-sm" style={{ backgroundColor: '#16744a' }}>
      <div className="container d-flex align-items-center justify-content-between px-3">
        <NavLink className="navbar-brand fw-bold fs-5 d-flex align-items-center gap-2 text-white" to="/inicio">
          <img
            src="/logo-apac.png"
            alt="Logo APAC"
            style={{ height: 40 }}
            className="me-2"
          />
        </NavLink>

        <div
          ref={buscaRef}
          className="flex-fill mx-3 position-relative"
          style={{ maxWidth: 520 }}
        >
          <form role="search" onSubmit={handleSubmit}>
            <div className="input-group input-group-sm">
              {buscaAtiva && (
                <button
                  type="button"
                  className="btn btn-light border"
                  onClick={limparBusca}
                  aria-label="Limpar busca e voltar ao início"
                  title="Limpar e voltar ao início"
                >
                  ✕
                </button>
              )}
              <input
                className="form-control"
                type="search"
                placeholder="Pesquisar opções..."
                aria-label="Pesquisar opções do menu"
                value={termo}
                onChange={(e) => {
                  setTermo(e.target.value);
                  setDropdownAberto(true);
                  if (e.target.value.trim()) navigate('/inicio');
                }}
                onFocus={() => buscaAtiva && setDropdownAberto(true)}
              />
            </div>
          </form>

          {dropdownAberto && buscaAtiva && (
            <ul
              className="list-group position-absolute w-100 shadow-sm mt-1 nav-search-dropdown"
              style={{ zIndex: 1050, maxHeight: 280, overflowY: 'auto' }}
            >
              {opcoesFiltradas.length === 0 ? (
                <li className="list-group-item text-muted small py-2">
                  Nenhuma opção encontrada.
                </li>
              ) : (
                opcoesFiltradas.map((opt) => (
                  <li key={opt.to}>
                    <button
                      type="button"
                      className="list-group-item list-group-item-action py-2 text-start w-100 border-0"
                      onClick={() => selecionarOpcao(opt.to)}
                    >
                      <div className="fw-medium">{opt.label}</div>
                      <div className="text-muted small">
                        {opt.group}
                        {opt.desc ? ` · ${opt.desc}` : ''}
                      </div>
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="text-white small d-none d-md-inline">
            {usuario?.nome}
          </span>
          <button
            type="button"
            className="btn btn-light btn-sm"
            onClick={async () => {
              await sair();
              navigate('/login');
            }}
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}
