/** Níveis de acesso do sistema (ENUM usuarios.permissao). */
export const PERMISSOES = [
  'Administrador',
  'Financeiro',
  'Veterinário',
  'Voluntário',
];

/** Recursos internos e quem pode acessar. */
export const MATRIZ_ACESSO = {
  inicio: PERMISSOES,
  'trocar-senha': PERMISSOES,
  usuarios: ['Administrador'],
  pessoas: ['Administrador', 'Financeiro', 'Voluntário'],
  animais: ['Administrador', 'Veterinário', 'Voluntário'],
  adocoes: ['Administrador', 'Voluntário'],
  voluntarios: ['Administrador'],
  apac: PERMISSOES,
  doacoes: ['Administrador', 'Financeiro', 'Voluntário'],
  campanhas: ['Administrador', 'Financeiro'],
  estoque: ['Administrador', 'Veterinário', 'Voluntário'],
  saude: ['Administrador', 'Veterinário'],
  financeiro: ['Administrador', 'Financeiro'],
  despesas: ['Administrador', 'Financeiro'],
  balancete: ['Administrador', 'Financeiro'],
  parceiros: ['Administrador', 'Financeiro'],
};

const ROTAS_RECURSO = [
  { test: (p) => p === '/inicio' || p.startsWith('/inicio/'), recurso: 'inicio' },
  { test: (p) => p === '/trocar-senha', recurso: 'trocar-senha' },
  { test: (p) => p === '/usuarios' || p.startsWith('/usuarios/'), recurso: 'usuarios' },
  { test: (p) => p === '/pessoas' || p.startsWith('/pessoas/'), recurso: 'pessoas' },
  { test: (p) => p === '/animais' || p.startsWith('/animais/'), recurso: 'animais' },
  { test: (p) => p === '/adocoes' || p.startsWith('/adocoes/'), recurso: 'adocoes' },
  { test: (p) => p === '/voluntarios' || p.startsWith('/voluntarios/'), recurso: 'voluntarios' },
  { test: (p) => p === '/apac', recurso: 'apac' },
  { test: (p) => p === '/apac/doacao' || p.startsWith('/apac/doacao/'), recurso: 'doacoes' },
  { test: (p) => p === '/apac/campanhas' || p.startsWith('/apac/campanhas/'), recurso: 'campanhas' },
  { test: (p) => p === '/apac/estoque' || p.startsWith('/apac/estoque/'), recurso: 'estoque' },
  { test: (p) => p === '/apac/saude' || p.startsWith('/apac/saude/'), recurso: 'saude' },
  {
    test: (p) => p === '/apac/financeiro' || p.startsWith('/apac/financeiro/'),
    recurso: 'financeiro',
  },
  { test: (p) => p === '/apac/despesas' || p.startsWith('/apac/despesas/'), recurso: 'despesas' },
  {
    test: (p) => p === '/apac/balancete' || p.startsWith('/apac/balancete/'),
    recurso: 'balancete',
  },
  {
    test: (p) => p === '/apac/parceiros' || p.startsWith('/apac/parceiros/'),
    recurso: 'parceiros',
  },
];

/** Normaliza legado Funcionário → Financeiro. */
export function normalizarPermissao(permissao) {
  if (permissao === 'Funcionário') return 'Financeiro';
  return permissao;
}

export function recursoDaRota(pathname) {
  const path = pathname.split('?')[0];
  const hit = ROTAS_RECURSO.find((item) => item.test(path));
  return hit?.recurso ?? null;
}

export function podeAcessarRecurso(permissao, recurso) {
  const nivel = normalizarPermissao(permissao);
  if (!nivel || !recurso) return false;
  if (nivel === 'Administrador') return true;
  const permitidos = MATRIZ_ACESSO[recurso];
  return Array.isArray(permitidos) && permitidos.includes(nivel);
}

export function podeAcessarRota(permissao, pathname) {
  const recurso = recursoDaRota(pathname);
  if (!recurso) return true;
  return podeAcessarRecurso(permissao, recurso);
}

/** Mantém itens públicos; filtra administrativos pela matriz. */
export function filtrarNavPorPermissao(options, permissao) {
  return options.filter((opt) => {
    if (opt.menu === 'public') return true;
    if (!opt.recurso) return podeAcessarRota(permissao, opt.to);
    return podeAcessarRecurso(permissao, opt.recurso);
  });
}
