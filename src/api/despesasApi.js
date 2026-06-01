import { apiRequest } from './client.js';
import { toIsoDate, formatDateBr } from '../utils/dates.js';

export function loadDespesas() {
  return apiRequest('/api/despesas');
}

export function createDespesa(form) {
  return apiRequest('/api/despesas', {
    method: 'POST',
    body: JSON.stringify({
      categoria: form.categoria,
      valor: form.valor,
      data_despesa: toIsoDate(form.data),
      fornecedor: form.fornecedor,
      animal: form.animal,
      forma_pagamento: form.pagamento,
      descricao: form.descricao,
    }),
  });
}

export function createCategoria(cat) {
  return apiRequest('/api/despesas/categorias', {
    method: 'POST',
    body: JSON.stringify(cat),
  });
}

export function deleteDespesa(id) {
  return apiRequest(`/api/despesas/${id}`, { method: 'DELETE' });
}

export function mapDespesasUi(data) {
  return {
    categorias: data.categorias || [],
    despesas: (data.despesas || []).map((d) => ({
      id: d.id,
      categoria: d.categoria,
      valor: d.valor,
      data: formatDateBr(d.data_despesa),
      fornecedor: d.fornecedor,
      animal: d.animal,
      pagamento: d.forma_pagamento,
      descricao: d.descricao,
    })),
  };
}
