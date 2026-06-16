import {
  listarParceiros,
  adicionarParceiro,
  atualizarParceiro,
  excluirParceiro,
} from '../utils/storageParceiros';

export const toParceiroPayload = (parceiro) => ({
  nome: (parceiro.nome || '').trim(),
  cpfCnpj: (parceiro.cpfCnpj || '').replace(/\D/g, ''),
  tipoNome: (parceiro.tipo || parceiro.tipoNome || '').trim(),
  telefone: (parceiro.telefone || '').trim(),
  email: (parceiro.email || '').trim(),
  endereco: (parceiro.endereco || '').trim(),
  status: parceiro.status || 'ativo',
  observacoes: (parceiro.observacoes || '').trim() || null,
});

export const listParceiros = (params) => listarParceiros(params);

export const createParceiro = async (payload) => adicionarParceiro(payload);

export const updateParceiro = async (id, payload) =>
  atualizarParceiro(id, payload);

export const deleteParceiro = (id) => excluirParceiro(id);
