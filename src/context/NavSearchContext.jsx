import { createContext, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { filterNavOptions } from '../data/navOptions';

const NavSearchContext = createContext(null);

export function NavSearchProvider({ children }) {
  const navigate = useNavigate();
  const [termo, setTermo] = useState('');

  const opcoesFiltradas = useMemo(() => filterNavOptions(termo), [termo]);

  function limparBusca() {
    setTermo('');
    navigate('/inicio');
  }

  const value = useMemo(
    () => ({
      termo,
      setTermo,
      opcoesFiltradas,
      limparBusca,
      buscaAtiva: termo.trim().length > 0,
    }),
    [termo, opcoesFiltradas]
  );

  return (
    <NavSearchContext.Provider value={value}>
      {children}
    </NavSearchContext.Provider>
  );
}

export function useNavSearch() {
  const ctx = useContext(NavSearchContext);
  if (!ctx) {
    throw new Error('useNavSearch deve ser usado dentro de NavSearchProvider');
  }
  return ctx;
}
