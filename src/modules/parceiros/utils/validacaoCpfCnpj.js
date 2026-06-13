export function formatarCpfCnpj(valor) {
  const numeros = (valor || '').replace(/\D/g, '');

  if (numeros.length <= 11) {
    return numeros
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  } else {
    return numeros
      .slice(0, 14)
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }
}

export function validarCpf(cpf) {
  const numeros = cpf.replace(/\D/g, '');
  if (numeros.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(numeros)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(numeros[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(numeros[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(numeros[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(numeros[10]);
}

export function validarCnpj(cnpj) {
  const numeros = cnpj.replace(/\D/g, '');
  if (numeros.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(numeros)) return false;

  const calc = (n, pesos) => {
    let soma = 0;
    for (let i = 0; i < pesos.length; i++)
      soma += parseInt(n[i]) * pesos[i];
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const p1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const p2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  return (
    calc(numeros, p1) === parseInt(numeros[12]) &&
    calc(numeros, p2) === parseInt(numeros[13])
  );
}

export function validarCpfCnpj(valor) {
  const numeros = (valor || '').replace(/\D/g, '');
  if (numeros.length === 11) return validarCpf(numeros);
  if (numeros.length === 14) return validarCnpj(numeros);
  return false;
}

export function tipoCpfCnpj(valor) {
  const numeros = (valor || '').replace(/\D/g, '');
  if (numeros.length <= 11) return 'CPF';
  return 'CNPJ';
}

export function formatarTelefone(valor) {
  const numeros = (valor || '').replace(/\D/g, '').slice(0, 11);

  if (numeros.length <= 10) {
    return numeros
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  } else {
    return numeros
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
  }
}

export function validarTelefone(valor) {
  const numeros = (valor || '').replace(/\D/g, '');
  return numeros.length === 10 || numeros.length === 11;
}
