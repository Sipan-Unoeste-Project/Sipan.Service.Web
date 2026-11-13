/** Regra de senha forte usada no login, recuperação e troca. */
export const SENHA_FORTE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

export const SENHA_FORTE_MSG =
  'A senha precisa ter 8 caracteres, com maiúscula, minúscula, número e especial (@$!%*?&).';

export function senhaForteValida(senha) {
  return typeof senha === 'string' && SENHA_FORTE.test(senha);
}
