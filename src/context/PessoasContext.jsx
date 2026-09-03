import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ApiError } from '../api/client';
import * as pessoasApi from '../api/pessoasApi';
import { useAuth } from './AuthContext';

const PessoasContext = createContext(null);

export function PessoasProvider({ children }) {
  const { autenticado } = useAuth();
  const [pessoas, setPessoas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const lista = await pessoasApi.listPessoas();
      setPessoas(
        lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }))
      );
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
    if (autenticado) {
      refresh();
      return;
    }
    setPessoas([]);
    setError('');
    setLoading(false);
  }, [autenticado, refresh]);

  async function addPessoa(data) {
    const nova = await pessoasApi.createPessoa(data);
    setPessoas((prev) =>
      [...prev, nova].sort((a, b) =>
        a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })
      )
    );
    return nova;
  }

  async function updatePessoa(data) {
    const atualizada = await pessoasApi.updatePessoa(data.id, data);
    setPessoas((prev) =>
      prev
        .map((p) => (p.id === atualizada.id ? atualizada : p))
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }))
    );
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
