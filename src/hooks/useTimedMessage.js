import { useState, useEffect } from 'react';

/** Mensagem temporária (ex.: feedback de sucesso). Retorna [msg, setMsg]. */
export function useTimedMessage(timeoutMs = 3500) {
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => setMessage(''), timeoutMs);
    return () => clearTimeout(timer);
  }, [message, timeoutMs]);

  return [message, setMessage];
}
