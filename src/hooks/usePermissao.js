import { useAuth } from '../context/AuthContext';
import {
  podeAcessarRecurso,
  podeAcessarRota,
  normalizarPermissao,
} from '../utils/permissoes';

/** Helpers de acesso com o usuário logado. */
export function usePermissao() {
  const { usuario, autenticado } = useAuth();
  const permissao = normalizarPermissao(usuario?.permissao);

  return {
    permissao,
    autenticado,
    podeRecurso: (recurso) => podeAcessarRecurso(permissao, recurso),
    podeRota: (pathname) => podeAcessarRota(permissao, pathname),
  };
}
