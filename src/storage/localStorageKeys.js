/** Chaves legadas — o app não usa mais localStorage como fonte da verdade. */
export const LOCAL_STORAGE_KEYS = [];

export function clearAllLocalData() {
  const legacy = [
    'sipan_pessoas',
    'sipan_usuarios',
    'sipan_funcionarios',
    'sipan_voluntarios',
    'usuarios',
    'funcionarios',
    'voluntarios',
    'estoqueAPAC',
    'apac_campanhas',
    'apac_financeiro',
    'apac_despesas',
    'apac_doacoes',
    'apac_saude',
  ];
  legacy.forEach((key) => localStorage.removeItem(key));
}
