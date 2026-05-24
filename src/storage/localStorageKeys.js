/** Chaves usadas pelo front enquanto o backend não está integrado. */
export const LOCAL_STORAGE_KEYS = [
  'sipan_pessoas',
  'sipan_animais',
  'usuarios',
  'funcionarios',
  'estoqueAPAC',
  'apac_campanhas',
  'apac_financeiro',
  'apac_despesas',
  'apac_doacoes',
  'apac_saude',
];

/** Remove todos os dados locais de demonstração. */
export function clearAllLocalData() {
  LOCAL_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}
