/** Opções de navegação pesquisáveis (menu + início). */
export const NAV_OPTIONS = [
  {
    to: '/inicio',
    label: 'Início',
    desc: 'Painel interno do SIPAN',
    group: 'Cadastros',
    menu: 'admin',
    recurso: 'inicio',
  },
  {
    to: '/trocar-senha',
    label: 'Trocar senha',
    desc: 'Alterar senha da conta',
    group: 'Sistema',
    menu: 'admin',
    recurso: 'trocar-senha',
  },
  {
    to: '/animais',
    label: 'Animais',
    desc: 'Cadastro interno de animais',
    group: 'Cadastros',
    menu: 'admin',
    recurso: 'animais',
  },
  {
    to: '/pessoas',
    label: 'Pessoas',
    desc: 'Doadores e adotantes',
    group: 'Cadastros',
    menu: 'admin',
    recurso: 'pessoas',
  },
  {
    to: '/adocoes',
    label: 'Adoções',
    desc: 'Solicitações de adoção',
    group: 'Cadastros',
    menu: 'admin',
    recurso: 'adocoes',
  },
  {
    to: '/usuarios',
    label: 'Usuários',
    desc: 'Acesso ao sistema e permissões',
    group: 'Cadastros',
    menu: 'admin',
    recurso: 'usuarios',
  },
  {
    to: '/voluntarios',
    label: 'Voluntários',
    desc: 'Equipe e voluntários do abrigo',
    group: 'Cadastros',
    menu: 'admin',
    recurso: 'voluntarios',
  },
  {
    to: '/apac',
    label: 'Painel APAC',
    desc: 'Visão geral do módulo',
    group: 'APAC',
    menu: 'admin',
    recurso: 'apac',
  },
  {
    to: '/apac/doacao',
    label: 'Doações',
    desc: 'Dinheiro, PIX e produtos',
    group: 'APAC',
    menu: 'admin',
    recurso: 'doacoes',
  },
  {
    to: '/apac/campanhas',
    label: 'Campanhas',
    desc: 'Eventos e metas',
    group: 'APAC',
    menu: 'admin',
    recurso: 'campanhas',
  },
  {
    to: '/apac/estoque',
    label: 'Estoque',
    desc: 'Produtos e insumos',
    group: 'APAC',
    menu: 'admin',
    recurso: 'estoque',
  },
  {
    to: '/apac/financeiro',
    label: 'Financeiro',
    desc: 'Entradas e saídas',
    group: 'APAC',
    menu: 'admin',
    recurso: 'financeiro',
  },
  {
    to: '/apac/despesas',
    label: 'Despesas',
    desc: 'Controle de gastos',
    group: 'APAC',
    menu: 'admin',
    recurso: 'despesas',
  },
  {
    to: '/apac/saude',
    label: 'Saúde animal',
    desc: 'Histórico veterinário',
    group: 'APAC',
    menu: 'admin',
    recurso: 'saude',
  },
  {
    to: '/apac/balancete',
    label: 'Balancete',
    desc: 'Relatório consolidado',
    group: 'APAC',
    menu: 'admin',
    recurso: 'balancete',
  },
  {
    to: '/apac/parceiros',
    label: 'Parceiros',
    desc: 'Organizações e empresas colaboradoras',
    group: 'APAC',
    menu: 'admin',
    recurso: 'parceiros',
  },
  { to: '/', label: 'Quem somos', desc: 'Sobre a instituição', group: 'Público', menu: 'public' },
  {
    to: '/publico/animais',
    label: 'Animais',
    desc: 'Animais para adoção',
    group: 'Público',
    menu: 'public',
  },
  {
    to: '/publico/doacoes',
    label: 'Doações',
    desc: 'Como doar',
    group: 'Público',
    menu: 'public',
  },
  {
    to: '/publico/campanhas',
    label: 'Campanhas',
    desc: 'Campanhas públicas',
    group: 'Público',
    menu: 'public',
  },
  { to: '/publico/contato', label: 'Contato', desc: 'Fale conosco', group: 'Público', menu: 'public' },
];

export function filterNavOptions(termo) {
  const q = termo.trim().toLowerCase();
  if (!q) return NAV_OPTIONS;
  return NAV_OPTIONS.filter((opt) => {
    const texto = `${opt.label} ${opt.desc ?? ''} ${opt.group}`.toLowerCase();
    return texto.includes(q);
  });
}

export function homeSectionsFromOptions(options) {
  const cadastros = options.filter((o) => o.group === 'Cadastros' && o.to !== '/inicio');
  const apac = options.filter((o) => o.group === 'APAC');
  return { cadastros, apac };
}

export function menuOptionsFromFilter(options, menu) {
  return options.filter((o) => o.menu === menu);
}
