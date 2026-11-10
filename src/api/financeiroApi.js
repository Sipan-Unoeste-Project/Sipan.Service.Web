import { apiRequest } from './client.js';
import { toIsoDate, formatDateBr, formatDateTimeBr } from '../utils/dates.js';

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
      campanha_id: form.campanhaId || null,
      observacoes: form.observacoes,
      comprovante: form.comprovante,
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
      comprovante: form.comprovante,
    }),
  });
}

export function anularEntrada(id, motivo) {
  return apiRequest(`/api/financeiro/entradas/${id}/anular`, {
    method: 'POST',
    body: JSON.stringify({ motivo }),
  });
}

export function anularSaida(id, motivo) {
  return apiRequest(`/api/financeiro/saidas/${id}/anular`, {
    method: 'POST',
    body: JSON.stringify({ motivo }),
  });
}

function mapAudit(row) {
  return {
    criadoPor: row.criado_por_nome || null,
    criadoEmBr: formatDateTimeBr(row.created_at),
    comprovante: row.comprovante || '',
    anulado: Boolean(row.anulado),
    anuladoEmBr: formatDateTimeBr(row.anulado_em),
    anuladoPor: row.anulado_por_nome || null,
    motivoAnulacao: row.motivo_anulacao || '',
  };
}

export function mapFinanceiroUi(data) {
  return {
    entradas: (data.entradas || []).map((e) => ({
      id: e.id,
      origem: e.origem,
      valor: e.valor,
      data: formatDateBr(e.data_lancamento),
      dataIso: toIsoDate(e.data_lancamento),
      responsavel: e.responsavel,
      campanhaId: e.campanha_id,
      campanha: e.campanha,
      observacoes: e.observacoes,
      ...mapAudit(e),
    })),
    saidas: (data.saidas || []).map((s) => ({
      id: s.id,
      tipo: s.tipo,
      valor: s.valor,
      data: formatDateBr(s.data_lancamento),
      dataIso: toIsoDate(s.data_lancamento),
      fornecedor: s.fornecedor,
      animal: s.animal,
      observacoes: s.observacoes,
      ...mapAudit(s),
    })),
  };
}
