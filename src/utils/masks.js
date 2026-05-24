/**
 * Aplica máscara de CPF: 000.000.000-00
 */
export function maskCPF(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length > 9)
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
  if (digits.length > 6)
    return digits.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
  if (digits.length > 3)
    return digits.replace(/(\d{3})(\d{1,3})/, '$1.$2');
  return digits;
}

/**
 * Aplica máscara de telefone: (00) 00000-0000 ou (00) 0000-0000
 */
export function maskPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length > 10)
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (digits.length > 6)
    return digits.replace(/(\d{2})(\d{4,5})(\d{0,4})/, '($1) $2-$3');
  if (digits.length > 2)
    return digits.replace(/(\d{2})(\d{0,5})/, '($1) $2');
  if (digits.length > 0)
    return `(${digits}`;
  return digits;
}
