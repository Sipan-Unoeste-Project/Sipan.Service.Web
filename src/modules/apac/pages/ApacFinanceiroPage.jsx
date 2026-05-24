import { useState, useEffect } from 'react';
import PageShell from '../../../components/PageShell';
import ApacTabs from '../components/ApacTabs';
import StatRow from '../components/StatRow';
import {
  loadFinanceiro,
  saveFinanceiro,
  parseValor,
  formatBRL,
  getDataAtual,
} from '../storage/apacStorage';

const emptyEntrada = {
  origem: 'Doação em dinheiro',
  valor: '',
  data: getDataAtual(),
  responsavel: '',
  campanha: '',
  observacoes: '',
};

const emptySaida = {
  tipo: 'Veterinário',
  valor: '',
  data: getDataAtual(),
  fornecedor: '',
  animal: '',
  observacoes: '',
};

export default function ApacFinanceiroPage() {
  const [data, setData] = useState({ entradas: [], saidas: [] });
  const [tab, setTab] = useState('entrada');
  const [formE, setFormE] = useState(emptyEntrada);
  const [formS, setFormS] = useState(emptySaida);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setData(loadFinanceiro());
  }, []);

  useEffect(() => {
    if (msg) {
      const t = setTimeout(() => setMsg(''), 3000);
      return () => clearTimeout(t);
    }
  }, [msg]);

  function persist(next) {
    setData(next);
    saveFinanceiro(next);
  }

  const totalEntrada = data.entradas.reduce((s, e) => s + e.valor, 0);
  const totalSaida = data.saidas.reduce((s, e) => s + e.valor, 0);
  const saldo = totalEntrada - totalSaida;

  function registrarEntrada(e) {
    e.preventDefault();
    persist({
      ...data,
      entradas: [
        {
          id: Date.now(),
          ...formE,
          valor: parseValor(formE.valor),
        },
        ...data.entradas,
      ],
    });
    setFormE({ ...emptyEntrada, data: getDataAtual() });
    setMsg('Entrada registrada.');
    setTab('historico');
  }

  function registrarSaida(e) {
    e.preventDefault();
    persist({
      ...data,
      saidas: [
        {
          id: Date.now(),
          ...formS,
          valor: parseValor(formS.valor),
        },
        ...data.saidas,
      ],
    });
    setFormS({ ...emptySaida, data: getDataAtual() });
    setMsg('Saída registrada.');
    setTab('historico');
  }

  const historico = [
    ...data.entradas.map((x) => ({ ...x, kind: 'entrada' })),
    ...data.saidas.map((x) => ({ ...x, kind: 'saida' })),
  ].sort((a, b) => b.id - a.id);

  return (
    <PageShell title="Financeiro" subtitle="Controle de entradas e saídas de caixa">
      {msg && <div className="alert alert-success py-2">{msg}</div>}

      <StatRow
        items={[
          { label: 'Entradas', value: formatBRL(totalEntrada), valueClass: 'text-success' },
          { label: 'Saídas', value: formatBRL(totalSaida), valueClass: 'text-danger' },
          {
            label: 'Saldo',
            value: formatBRL(saldo),
            valueClass: saldo >= 0 ? 'text-primary' : 'text-danger',
            sub: saldo >= 0 ? 'Positivo' : 'Negativo',
          },
        ]}
      />

      <ApacTabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'entrada', label: 'Registrar entrada' },
          { id: 'saida', label: 'Registrar saída' },
          { id: 'historico', label: 'Histórico' },
        ]}
      />

      {tab === 'entrada' && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <form onSubmit={registrarEntrada}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Origem</label>
                  <select
                    className="form-select"
                    value={formE.origem}
                    onChange={(e) => setFormE({ ...formE, origem: e.target.value })}
                  >
                    <option>Doação em dinheiro</option>
                    <option>Evento / Campanha</option>
                    <option>Patrocínio</option>
                    <option>Outro</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Valor (R$)</label>
                  <input
                    className="form-control"
                    value={formE.valor}
                    onChange={(e) => setFormE({ ...formE, valor: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Data</label>
                  <input
                    className="form-control"
                    value={formE.data}
                    onChange={(e) => setFormE({ ...formE, data: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Doador / Responsável</label>
                  <input
                    className="form-control"
                    value={formE.responsavel}
                    onChange={(e) => setFormE({ ...formE, responsavel: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Campanha (opcional)</label>
                  <input
                    className="form-control"
                    value={formE.campanha}
                    onChange={(e) => setFormE({ ...formE, campanha: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Observações</label>
                  <input
                    className="form-control"
                    value={formE.observacoes}
                    onChange={(e) => setFormE({ ...formE, observacoes: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-success mt-3">
                Registrar entrada
              </button>
            </form>
          </div>
        </div>
      )}

      {tab === 'saida' && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <form onSubmit={registrarSaida}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Tipo de despesa</label>
                  <select
                    className="form-select"
                    value={formS.tipo}
                    onChange={(e) => setFormS({ ...formS, tipo: e.target.value })}
                  >
                    <option>Veterinário</option>
                    <option>Alimentação / Ração</option>
                    <option>Medicamentos</option>
                    <option>Material de limpeza</option>
                    <option>Transporte</option>
                    <option>Outro</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Valor (R$)</label>
                  <input
                    className="form-control"
                    value={formS.valor}
                    onChange={(e) => setFormS({ ...formS, valor: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Data</label>
                  <input
                    className="form-control"
                    value={formS.data}
                    onChange={(e) => setFormS({ ...formS, data: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Fornecedor</label>
                  <input
                    className="form-control"
                    value={formS.fornecedor}
                    onChange={(e) => setFormS({ ...formS, fornecedor: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Animal (opcional)</label>
                  <input
                    className="form-control"
                    value={formS.animal}
                    onChange={(e) => setFormS({ ...formS, animal: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Observações</label>
                  <input
                    className="form-control"
                    value={formS.observacoes}
                    onChange={(e) => setFormS({ ...formS, observacoes: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-danger mt-3">
                Registrar saída
              </button>
            </form>
          </div>
        </div>
      )}

      {tab === 'historico' && (
        <div className="list-group">
          {historico.length === 0 ? (
            <p className="text-muted">Nenhum lançamento.</p>
          ) : (
            historico.map((l) => (
              <div
                key={`${l.kind}-${l.id}`}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>
                    {l.kind === 'entrada'
                      ? l.origem
                      : `${l.tipo} — ${l.fornecedor || '—'}`}
                  </strong>
                  <div className="small text-muted">
                    {l.data}
                    {l.kind === 'entrada' && l.responsavel && ` · ${l.responsavel}`}
                    {l.kind === 'saida' && l.animal && ` · ${l.animal}`}
                  </div>
                </div>
                <span className={l.kind === 'entrada' ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                  {l.kind === 'entrada' ? '+' : '−'} {formatBRL(l.valor)}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </PageShell>
  );
}
