import { apiRequest, buildQuery } from './client.js';
import { formatDateBr, formatDateTimeBr } from '../utils/dates.js';

const CATEGORIA_LABEL = {
  alimentos: 'Alimentos',
  medicamentos: 'Medicamentos',
  limpeza: 'Limpeza',
  acessorios: 'Acessórios',
};

const ACAO_LABEL = {
  criacao: 'Criação',
  alteracao: 'Alteração',
  ajuste: 'Ajuste',
  exclusao: 'Exclusão',
};

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

/** Movimenta estoque: tipo 'entrada' | 'saida', quantidade > 0 e justificativa obrigatória. */
export function movimentarEstoque(id, { tipo, quantidade, justificativa }) {
  return apiRequest(`/api/estoque/${id}/quantidade`, {
    method: 'PATCH',
    body: JSON.stringify({ tipo, quantidade, justificativa }),
  });
}

export function deleteEstoqueItem(id) {
  return apiRequest(`/api/estoque/${id}`, { method: 'DELETE' });
}

export function listMovimentosEstoque(id) {
  return apiRequest(`/api/estoque/${id}/movimentos`);
}

export function labelCategoria(categoria) {
  return CATEGORIA_LABEL[categoria] || categoria || '—';
}

export function labelAcaoMovimento(acao) {
  return ACAO_LABEL[acao] || acao || '—';
}

/** UI usa `qtde`; API usa `quantidade`. */
export function mapEstoqueUi(item) {
  return {
    ...item,
    qtde: item.quantidade,
    categoriaLabel: labelCategoria(item.categoria),
    validadeBr: formatDateBr(item.validade),
    atualizadoEmBr: formatDateTimeBr(item.updated_at),
    atualizadoPor: item.atualizado_por_nome || null,
  };
}

export function mapMovimentoUi(m) {
  return {
    ...m,
    acaoLabel: labelAcaoMovimento(m.acao),
    createdAtBr: formatDateTimeBr(m.created_at),
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
