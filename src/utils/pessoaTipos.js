/** Perfis disponíveis no cadastro de pessoas (doador / adotante). */
export const PERFIS_PESSOA = [
  { value: 'doador', label: 'Doador' },
  { value: 'adotante', label: 'Adotante' },
];

export const PERFIS_LABEL = Object.fromEntries(
  PERFIS_PESSOA.map(({ value, label }) => [value, label])
);

/** Normaliza resposta da API ou formulário legado (`tipo` único) → `tipos[]`. */
export function normalizeTipos(data) {
  if (Array.isArray(data?.tipos) && data.tipos.length) {
    return data.tipos.filter((t) => PERFIS_LABEL[t]);
  }
  if (data?.tipo && PERFIS_LABEL[data.tipo]) return [data.tipo];
  return [];
}

/** Monta corpo JSON para POST/PUT /api/pessoas. */
export function toPessoaPayload(form) {
  return {
    nome: form.nome,
    cpf: form.cpf,
    tipos: normalizeTipos(form),
    telefone: form.telefone,
    email: form.email || null,
    cep: form.cep || null,
    endereco: form.endereco || null,
    numero: form.numero || null,
    bairro: form.bairro || null,
    cidade: form.cidade || null,
    estado: form.estado || null,
    obs: form.obs || null,
  };
}
