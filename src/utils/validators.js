/**
 * Valida CPF pelo algoritmo dos dígitos verificadores.
 */
export function validateCPF(cpf) {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false; // todos iguais

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(digits[i]) * (10 - i);
  let r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== Number(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(digits[i]) * (11 - i);
  r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === Number(digits[10]);
}

/**
 * Valida todos os campos do formulário.
 * @param {object} data - dados do formulário
 * @param {string[]} existingCPFs - CPFs já cadastrados (somente dígitos), exceto o da própria pessoa em edição
 * @returns {object} - objeto com mensagens de erro por campo
 */
export function validateForm(data, existingCPFs = []) {
  const errors = {};

  if (!data.nome.trim()) {
    errors.nome = 'Nome é obrigatório.';
  } else if (data.nome.trim().length < 3) {
    errors.nome = 'Mínimo de 3 caracteres.';
  }

  if (!data.cpf.trim()) {
    errors.cpf = 'CPF é obrigatório.';
  } else if (!validateCPF(data.cpf)) {
    errors.cpf = 'CPF inválido.';
  } else if (existingCPFs.includes(data.cpf.replace(/\D/g, ''))) {
    errors.cpf = 'CPF já cadastrado para outra pessoa.';
  }

  if (!data.tipo) {
    errors.tipo = 'Selecione um tipo.';
  }

  if (!data.telefone.trim()) {
    errors.telefone = 'Telefone é obrigatório.';
  } else if (data.telefone.replace(/\D/g, '').length < 10) {
    errors.telefone = 'Telefone inválido (mínimo 10 dígitos).';
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'E-mail inválido.';
  }

  return errors;
}
