import {
  listarParceiros as apiListarParceiros,
  createParceiro,
  updateParceiro,
  deleteParceiro,
  listarTiposParceiro as apiListarTipos,
  adicionarTipoParceiro as apiAdicionarTipo,
} from '../../../api/parceirosApi.js';

export const listarParceiros = (params) => apiListarParceiros(params);

export const adicionarParceiro = async (parceiro) => {
  return createParceiro(toParceiroPayload(parceiro));
};

export const atualizarParceiro = async (id, parceiroAtualizado) => {
  return updateParceiro(id, toParceiroPayload(parceiroAtualizado));
};

export const excluirParceiro = (id) => deleteParceiro(id);

export async function listarTiposParceiro() {
  try {
    const tipos = await apiListarTipos();
    if (Array.isArray(tipos)) {
      return tipos.map(t => (typeof t === 'string' ? t : t.nome || t)).filter(Boolean);
    }
    return [];
  } catch (error) {
    console.error('Erro ao listar tipos de parceiro:', error);
    return [];
  }
}

export async function adicionarTipoParceiro(tipo) {
  const nome = (tipo || '').trim();
  if (!nome) {
    return await listarTiposParceiro();
  }

  try {
    await apiAdicionarTipo(nome);
    return await listarTiposParceiro(); 
  } catch (error) {
    if (error.status === 409 || error.message?.toLowerCase().includes('duplicado') || 
        error.message?.toLowerCase().includes('já existe')) {
      throw new Error('Este tipo de parceiro já existe.');
    }
    throw error;
  }
}

export const toParceiroPayload = (parceiro) => ({
  nome: (parceiro.nome || '').trim(),
  cpfCnpj: (parceiro.cpfCnpj || '').trim(),
  tipoNome: (parceiro.tipo || '').trim(),
  tipoId: parceiro.tipoId || null,
  telefone: (parceiro.telefone || '').trim(),
  email: (parceiro.email || '').trim(),
  endereco: (parceiro.endereco || '').trim(),
  status: parceiro.status || 'ativo',
  observacoes: (parceiro.observacoes || '').trim() || null,
});
