import { createContext, useContext, useReducer, useEffect } from 'react';

const STORAGE_KEY = 'sipan_pessoas';

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return action.payload;
    case 'ADD':
      return [...state, action.payload];
    case 'UPDATE':
      return state.map((p) => (p.id === action.payload.id ? action.payload : p));
    case 'DELETE':
      return state.filter((p) => p.id !== action.payload);
    default:
      return state;
  }
}

const PessoasContext = createContext(null);

export function PessoasProvider({ children }) {
  const [pessoas, dispatch] = useReducer(reducer, []);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    dispatch({
      type: 'LOAD',
      payload: stored ? JSON.parse(stored) : [],
    });
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pessoas));
  }, [pessoas]);

  function addPessoa(data) {
    const nova = {
      ...data,
      id: Date.now(),
      criadoEm: new Date().toISOString().split('T')[0],
    };
    dispatch({ type: 'ADD', payload: nova });
    return nova;
  }

  function updatePessoa(data) {
    dispatch({ type: 'UPDATE', payload: data });
  }

  function deletePessoa(id) {
    dispatch({ type: 'DELETE', payload: id });
  }

  return (
    <PessoasContext.Provider value={{ pessoas, addPessoa, updatePessoa, deletePessoa }}>
      {children}
    </PessoasContext.Provider>
  );
}

export function usePessoas() {
  const ctx = useContext(PessoasContext);
  if (!ctx) throw new Error('usePessoas precisa estar dentro de PessoasProvider');
  return ctx;
}
