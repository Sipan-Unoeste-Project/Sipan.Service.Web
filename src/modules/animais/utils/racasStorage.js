import { listarRacas as apiListarRacas, adicionarRaca as apiAdicionarRaca } from '../../../api/racasApi.js';

export async function listarRacas(especie) {
    if (!especie) return [];
    try {
        const racas = await apiListarRacas(especie);
        return Array.isArray(racas) ? racas : [];
    } catch (error) {
        console.error('Erro ao carregar raças:', error);
        return [];
    }
}

export async function adicionarNovaRaca(especie, raca) {
    const nome = (raca || '').trim();
    if (!especie || !nome) {
        return await listarRacas(especie);
    }

    try {
        await apiAdicionarRaca(especie, nome);
        return await listarRacas(especie);
    } catch (error) {
        if (error.status === 409 || error.message?.toLowerCase().includes('duplicate') || 
            error.message?.toLowerCase().includes('já existe')) {
            throw new Error('Esta raça já está cadastrada para esta espécie.');
        }
        console.error('Erro ao adicionar raça:', error);
        throw error;
    }
}