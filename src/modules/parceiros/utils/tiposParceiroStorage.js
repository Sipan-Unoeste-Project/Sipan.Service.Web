import { loadJson, saveJson } from '../../../storage/localJsonStorage';
import { TIPOS_PARCEIRO_DEFAULT } from './modeloParceiro';

const KEY = 'sipan_parceiros_tipos_v1';

function loadAll() {
  return loadJson(KEY, null);
}

export function listarTiposParceiro() {
  const stored = loadAll();

  if (!Array.isArray(stored)) {
    saveJson(KEY, TIPOS_PARCEIRO_DEFAULT);
    return [...TIPOS_PARCEIRO_DEFAULT];
  }

  return [...stored].sort((a, b) =>
    a.localeCompare(b, 'pt', { sensitivity: 'base' })
  );
}

export function adicionarTipoParceiro(tipo) {
  const nome = (tipo || '').trim();
  if (!nome) return listarTiposParceiro();

  const lista = listarTiposParceiro();
  const exists = lista.some(
    (t) => t.toLowerCase() === nome.toLowerCase()
  );
  if (exists) return lista;

  const nova = [...lista, nome].sort((a, b) =>
    a.localeCompare(b, 'pt', { sensitivity: 'base' })
  );
  saveJson(KEY, nova);
  return nova;
}

export default { listarTiposParceiro, adicionarTipoParceiro };
