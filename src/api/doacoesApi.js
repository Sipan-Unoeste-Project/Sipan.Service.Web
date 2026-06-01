import { apiRequest } from './client.js';
import { toIsoDate } from '../utils/dates.js';
import { formatDateBr } from '../utils/dates.js';

export function listDoacoes(params) {
  return apiRequest(`/api/doacoes${params?.busca ? `?busca=${encodeURIComponent(params.busca)}` : ''}`);
}

export function createDoacaoDinheiro(form) {
  return apiRequest('/api/doacoes', {
    method: 'POST',
    body: JSON.stringify({
      tipo: 'dinheiro',
      nome: form.nome,
      telefone: form.telefone,
      email: form.email,
      valor: form.valor,
      forma_pagamento: form.pagamento,
      mensagem: form.mensagem,
      anonimo: form.anonimo,
      data_doacao: toIsoDate(form.data) || new Date().toISOString().slice(0, 10),
    }),
  });
}

export function createDoacaoProduto(formP, itens) {
  return apiRequest('/api/doacoes', {
    method: 'POST',
    body: JSON.stringify({
      tipo: 'produto',
      nome: formP.nome,
      telefone: formP.telefone,
      email: formP.email,
      mensagem: formP.mensagem,
      anonimo: formP.anonimo,
      data_doacao: new Date().toISOString().slice(0, 10),
      itens: itens.map((i) => ({
        produto: i.produto,
        quantidade: i.quantidade,
        unidade: i.unidade?.toLowerCase().includes('unidade') ? 'unidades' : 'unidades',
      })),
    }),
  });
}

/** Mapeia DTO da API para exibição na lista. */
export function mapDoacaoUi(d) {
  return {
    id: d.id,
    tipo: d.tipo,
    nome: d.nome,
    anonimo: d.anonimo,
    valor: d.valor,
    itens: d.itens,
    data: formatDateBr(d.data_doacao) || d.data_doacao,
  };
}
