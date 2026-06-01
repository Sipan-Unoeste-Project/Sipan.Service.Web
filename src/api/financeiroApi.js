import { apiRequest } from './client.js';
import { toIsoDate, formatDateBr } from '../utils/dates.js';

export function loadFinanceiro() {
  return apiRequest('/api/financeiro');
}

export function createEntrada(form) {
  return apiRequest('/api/financeiro/entradas', {
    method: 'POST',
    body: JSON.stringify({
      origem: form.origem,
      valor: form.valor,
      data_lancamento: toIsoDate(form.data),
      responsavel: form.responsavel,
      observacoes: form.observacoes,
    }),
  });
}

export function createSaida(form) {
  return apiRequest('/api/financeiro/saidas', {
    method: 'POST',
    body: JSON.stringify({
      tipo: form.tipo,
      valor: form.valor,
      data_lancamento: toIsoDate(form.data),
      fornecedor: form.fornecedor,
      animal: form.animal,
      observacoes: form.observacoes,
    }),
  });
}

export function mapFinanceiroUi(data) {
  return {
    entradas: (data.entradas || []).map((e) => ({
      id: e.id,
      origem: e.origem,
      valor: e.valor,
      data: formatDateBr(e.data_lancamento),
      responsavel: e.responsavel,
      campanha: e.campanha,
      observacoes: e.observacoes,
    })),
    saidas: (data.saidas || []).map((s) => ({
      id: s.id,
      tipo: s.tipo,
      valor: s.valor,
      data: formatDateBr(s.data_lancamento),
      fornecedor: s.fornecedor,
      animal: s.animal,
      observacoes: s.observacoes,
    })),
  };
}
