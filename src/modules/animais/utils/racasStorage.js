import { loadJson, saveJson } from '../../../storage/localJsonStorage';

const KEY = 'animais_racas_v1';

function loadAll() {
  return loadJson(KEY, {});
}

export function listarRacas(especie) {
  if (!especie) return [];
  const all = loadAll();
  const list = Array.isArray(all[especie]) ? [...all[especie]] : [];
  return list.sort((a, b) => a.localeCompare(b, 'pt', { sensitivity: 'base' }));
}

export function adicionarRaca(especie, raca) {
  if (!especie) throw new Error('Espécie é necessária para cadastrar raça');
  const nome = (raca || '').trim();
  if (!nome) return listarRacas(especie);

  const all = loadAll();
  const list = Array.isArray(all[especie]) ? all[especie] : [];
  const exists = list.some((r) => r.toLowerCase() === nome.toLowerCase());
  if (exists) return list;

  list.push(nome);
  // persist sorted
  const sorted = list.sort((a, b) => a.localeCompare(b, 'pt', { sensitivity: 'base' }));
  all[especie] = sorted;
  saveJson(KEY, all);
  return sorted;
}

export default { listarRacas, adicionarRaca };
