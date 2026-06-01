import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ApiError } from '../api/client';
import * as pessoasApi from '../api/pessoasApi';

const PessoasContext = createContext(null);

export function PessoasProvider({ children }) {
  const [pessoas, setPessoas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const lista = await pessoasApi.listPessoas();
      setPessoas(lista);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar pessoas. Verifique se a API está em execução.';
      setError(msg);
      setPessoas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addPessoa(data) {
    const nova = await pessoasApi.createPessoa(data);
    setPessoas((prev) => [...prev, nova]);
    return nova;
  }

  async function updatePessoa(data) {
    const atualizada = await pessoasApi.updatePessoa(data.id, data);
    setPessoas((prev) => prev.map((p) => (p.id === atualizada.id ? atualizada : p)));
    return atualizada;
  }

  async function deletePessoa(id) {
    await pessoasApi.deletePessoa(id);
    setPessoas((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <PessoasContext.Provider
      value={{
        pessoas,
        loading,
        error,
        refresh,
        addPessoa,
        updatePessoa,
        deletePessoa,
      }}
    >
      {children}
    </PessoasContext.Provider>
  );
}

export function usePessoas() {
  const ctx = useContext(PessoasContext);
  if (!ctx) throw new Error('usePessoas precisa estar dentro de PessoasProvider');
  return ctx;
}
