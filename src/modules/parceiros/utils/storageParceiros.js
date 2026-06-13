import { loadJson, saveJson } from '../../../storage/localJsonStorage';

const KEY = 'sipan_parceiros_v1';

function loadAll() {
  return loadJson(KEY, []);
}

function gerarId() {
  return `parceiro_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function listarParceiros() {
  const lista = loadAll();
  return Array.isArray(lista) ? lista : [];
}

export function adicionarParceiro(parceiro) {
  const lista = listarParceiros();
  const novo = { ...parceiro, id: gerarId() };
  saveJson(KEY, [...lista, novo]);
  return novo;
}

export function atualizarParceiro(id, parceiroAtualizado) {
  const lista = listarParceiros();
  const index = lista.findIndex((p) => p.id === id);
  if (index === -1) throw new Error('Parceiro não encontrado');
  lista[index] = { ...lista[index], ...parceiroAtualizado, id };
  saveJson(KEY, lista);
  return lista[index];
}

export function excluirParceiro(id) {
  const lista = listarParceiros();
  const nova = lista.filter((p) => p.id !== id);
  saveJson(KEY, nova);
}

export default { listarParceiros, adicionarParceiro, atualizarParceiro, excluirParceiro };
