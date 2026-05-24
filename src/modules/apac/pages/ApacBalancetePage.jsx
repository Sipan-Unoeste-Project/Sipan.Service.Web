import { useMemo } from 'react';
import PageShell from '../../../components/PageShell';
import StatRow from '../components/StatRow';
import { loadFinanceiro, loadDespesas, formatBRL } from '../storage/apacStorage';

function agruparPorCampo(lista, campo) {
  return lista.reduce((acc, item) => {
    const chave = item[campo] || 'Outros';
    acc[chave] = (acc[chave] || 0) + item.valor;
    return acc;
  }, {});
}

export default function ApacBalancetePage() {
  const financeiro = loadFinanceiro();
  const despesas = loadDespesas();

  const resumo = useMemo(() => {
    const entradas = financeiro.entradas.reduce((s, e) => s + e.valor, 0);
    const saidasFin = financeiro.saidas.reduce((s, e) => s + e.valor, 0);
    const saidasDesp = despesas.despesas.reduce((s, e) => s + e.valor, 0);
    const totalSaidas = saidasFin + saidasDesp;
    const saldo = entradas - totalSaidas;
    const taxa = entradas > 0 ? ((totalSaidas / entradas) * 100).toFixed(1) : '0';

    const porOrigem = agruparPorCampo(financeiro.entradas, 'origem');
    const porTipo = agruparPorCampo(financeiro.saidas, 'tipo');

    return { entradas, totalSaidas, saldo, taxa, porOrigem, porTipo };
  }, [financeiro, despesas]);

  return (
    <PageShell
      title="Balancete"
      subtitle="Relatório financeiro consolidado (dados do módulo Financeiro e Despesas)"
    >
      <StatRow
        items={[
          { label: 'Total entradas', value: formatBRL(resumo.entradas), valueClass: 'text-success' },
          { label: 'Total saídas', value: formatBRL(resumo.totalSaidas), valueClass: 'text-danger' },
          { label: 'Saldo', value: formatBRL(resumo.saldo), valueClass: 'text-primary' },
          {
            label: 'Taxa de gastos',
            value: `${resumo.taxa}%`,
            sub: 'Saídas / entradas',
          },
        ]}
      />

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-success bg-opacity-10 fw-semibold text-success">
              Entradas por origem
            </div>
            <ul className="list-group list-group-flush">
              {Object.entries(resumo.porOrigem).map(([cat, val]) => (
                <li
                  key={cat}
                  className="list-group-item d-flex justify-content-between"
                >
                  <span>{cat}</span>
                  <span className="text-success fw-semibold">{formatBRL(val)}</span>
                </li>
              ))}
              {Object.keys(resumo.porOrigem).length === 0 && (
                <li className="list-group-item text-muted">Sem entradas</li>
              )}
            </ul>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-danger bg-opacity-10 fw-semibold text-danger">
              Saídas por tipo
            </div>
            <ul className="list-group list-group-flush">
              {Object.entries(resumo.porTipo).map(([cat, val]) => (
                <li
                  key={cat}
                  className="list-group-item d-flex justify-content-between"
                >
                  <span>{cat}</span>
                  <span className="text-danger fw-semibold">{formatBRL(val)}</span>
                </li>
              ))}
              {Object.keys(resumo.porTipo).length === 0 && (
                <li className="list-group-item text-muted">Sem saídas</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <p className="text-muted small mt-4 mb-0">
        Os valores são calculados a partir dos lançamentos salvos em Financeiro e Despesas.
      </p>
    </PageShell>
  );
}
