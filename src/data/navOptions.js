/** Opções de navegação pesquisáveis (menu + início). */
export const NAV_OPTIONS = [
  { to: '/pessoas', label: 'Pessoas', desc: 'Doadores e adotantes', group: 'Cadastros' },
  { to: '/animais', label: 'Animais', desc: 'Cadastro e acompanhamento dos animais', group: 'Cadastros' },
  { to: '/adocoes', label: 'Adoções', desc: 'Solicitações de adoção', group: 'Cadastros', menu: 'admin' },
  { to: '/usuarios', label: 'Usuários', desc: 'Acesso ao sistema e permissões', group: 'Cadastros', menu: 'admin' },
  { to: '/voluntarios', label: 'Voluntários', desc: 'Equipe e voluntários do abrigo', group: 'Cadastros', menu: 'admin' },
  { to: '/apac', label: 'Painel APAC', desc: 'Visão geral do módulo', group: 'APAC', menu: 'admin' },
  { to: '/apac/doacao', label: 'Doações', desc: 'Dinheiro, PIX e produtos', group: 'APAC', menu: 'admin' },
  { to: '/apac/campanhas', label: 'Campanhas', desc: 'Eventos e metas', group: 'APAC', menu: 'admin' },
  { to: '/apac/estoque', label: 'Estoque', desc: 'Produtos e insumos', group: 'APAC', menu: 'admin' },
  { to: '/apac/financeiro', label: 'Financeiro', desc: 'Entradas e saídas', group: 'APAC', menu: 'admin' },
  { to: '/apac/despesas', label: 'Despesas', desc: 'Controle de gastos', group: 'APAC', menu: 'admin' },
  { to: '/apac/saude', label: 'Saúde animal', desc: 'Histórico veterinário', group: 'APAC', menu: 'admin' },
  { to: '/apac/balancete', label: 'Balancete', desc: 'Relatório consolidado', group: 'APAC', menu: 'admin' },
  { to: '/apac/parceiros', label: 'Parceiros', desc: 'Organizações e empresas colaboradoras', group: 'APAC', menu: 'admin' },
  { to: '/', label: 'Quem somos', desc: 'Sobre a instituição', group: 'Público', menu: 'public' },
  { to: '/publico/animais', label: 'Animais', desc: 'Animais para adoção', group: 'Público', menu: 'public' },
  { to: '/publico/doacoes', label: 'Doações', desc: 'Como doar', group: 'Público', menu: 'public' },
  { to: '/publico/campanhas', label: 'Campanhas', desc: 'Campanhas públicas', group: 'Público', menu: 'public' },
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
  const cadastros = options.filter((o) => o.group === 'Cadastros');
  const apac = options.filter((o) => o.group === 'APAC');
  return { cadastros, apac };
}

export function menuOptionsFromFilter(options, menu) {
  return options.filter((o) => o.menu === menu);
}