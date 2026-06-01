import { apiRequest, buildQuery } from './client.js';

export function listEstoque({ busca, categoria, status } = {}) {
  return apiRequest(`/api/estoque${buildQuery({ busca, categoria, status })}`);
}

export function createEstoqueItem(body) {
  return apiRequest('/api/estoque', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateEstoqueItem(id, body) {
  return apiRequest(`/api/estoque/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function patchEstoqueQuantidade(id, delta) {
  return apiRequest(`/api/estoque/${id}/quantidade`, {
    method: 'PATCH',
    body: JSON.stringify({ delta }),
  });
}

export function deleteEstoqueItem(id) {
  return apiRequest(`/api/estoque/${id}`, { method: 'DELETE' });
}

/** UI usa `qtde`; API usa `quantidade`. */
export function mapEstoqueUi(item) {
  return {
    ...item,
    qtde: item.quantidade,
  };
}

export function formToEstoqueBody(form, limite = 5) {
  return {
    item: form.nome.trim(),
    categoria: form.categoria,
    quantidade: parseInt(form.qtde, 10) || 0,
    unidade: form.unidade,
    validade: form.validade || null,
    local: form.local?.trim() || null,
    limite_baixo_estoque: limite,
  };
}
