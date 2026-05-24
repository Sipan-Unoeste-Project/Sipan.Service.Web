import { useState, useEffect } from 'react';
import PageShell from '../../../components/PageShell';
import ApacTabs from '../components/ApacTabs';
import {
  loadDespesas,
  saveDespesas,
  parseValor,
  formatBRL,
  getDataAtual,
} from '../storage/apacStorage';

const emptyDespesa = {
  categoria: 'Veterinário',
  valor: '',
  data: getDataAtual(),
  fornecedor: '',
  animal: '',
  pagamento: 'PIX',
  descricao: '',
};

export default function ApacDespesasPage() {
  const [data, setData] = useState({ categorias: [], despesas: [] });
  const [tab, setTab] = useState('lista');
  const [form, setForm] = useState(emptyDespesa);
  const [novaCat, setNovaCat] = useState({ nome: '', descricao: '', icone: '📁' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setData(loadDespesas());
  }, []);

  useEffect(() => {
    if (msg) {
      const t = setTimeout(() => setMsg(''), 3000);
      return () => clearTimeout(t);
    }
  }, [msg]);

  function persist(next) {
    setData(next);
    saveDespesas(next);
  }

  function salvarDespesa(e) {
    e.preventDefault();
    persist({
      ...data,
      despesas: [
        {
          id: Date.now(),
          ...form,
          valor: parseValor(form.valor),
        },
        ...data.despesas,
      ],
    });
    setForm({ ...emptyDespesa, data: getDataAtual() });
    setMsg('Despesa registrada.');
    setTab('lista');
  }

  function salvarCategoria(e) {
    e.preventDefault();
    persist({
      ...data,
      categorias: [...data.categorias, { id: Date.now(), ...novaCat }],
    });
    setNovaCat({ nome: '', descricao: '', icone: '📁' });
    setMsg('Categoria adicionada.');
  }

  function excluirDespesa(id) {
    if (!window.confirm('Excluir despesa?')) return;
    persist({ ...data, despesas: data.despesas.filter((d) => d.id !== id) });
    setMsg('Despesa excluída.');
  }

  return (
    <PageShell title="Despesas" subtitle="Categorias e gastos do abrigo">
      {msg && <div className="alert alert-success py-2">{msg}</div>}

      <ApacTabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'lista', label: 'Lista de despesas' },
          { id: 'nova', label: 'Nova despesa' },
          { id: 'categorias', label: 'Categorias' },
        ]}
      />

      {tab === 'nova' && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <form onSubmit={salvarDespesa}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Categoria</label>
                  <select
                    className="form-select"
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  >
                    {data.categorias.map((c) => (
                      <option key={c.id}>{c.nome}</option>
                    ))}
                    <option>Outro</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Valor (R$)</label>
                  <input
                    className="form-control"
                    value={form.valor}
                    onChange={(e) => setForm({ ...form, valor: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Data</label>
                  <input
                    className="form-control"
                    value={form.data}
                    onChange={(e) => setForm({ ...form, data: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Fornecedor</label>
                  <input
                    className="form-control"
                    value={form.fornecedor}
                    onChange={(e) => setForm({ ...form, fornecedor: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Animal (opcional)</label>
                  <input
                    className="form-control"
                    value={form.animal}
                    onChange={(e) => setForm({ ...form, animal: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Pagamento</label>
                  <select
                    className="form-select"
                    value={form.pagamento}
                    onChange={(e) => setForm({ ...form, pagamento: e.target.value })}
                  >
                    <option>PIX</option>
                    <option>Dinheiro</option>
                    <option>Cartão</option>
                    <option>Transferência</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Descrição</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={form.descricao}
                    onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-success mt-3">
                Registrar despesa
              </button>
            </form>
          </div>
        </div>
      )}

      {tab === 'categorias' && (
        <>
          <div className="row g-3 mb-4">
            {data.categorias.map((c) => (
              <div className="col-md-4" key={c.id}>
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <span className="fs-4">{c.icone}</span>
                    <h6 className="fw-semibold mt-2">{c.nome}</h6>
                    <p className="text-muted small mb-0">{c.descricao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="fw-semibold mb-3">Nova categoria</h6>
              <form onSubmit={salvarCategoria} className="row g-2">
                <div className="col-md-4">
                  <input
                    className="form-control"
                    placeholder="Nome"
                    value={novaCat.nome}
                    onChange={(e) => setNovaCat({ ...novaCat, nome: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <input
                    className="form-control"
                    placeholder="Descrição"
                    value={novaCat.descricao}
                    onChange={(e) => setNovaCat({ ...novaCat, descricao: e.target.value })}
                  />
                </div>
                <div className="col-md-2">
                  <button type="submit" className="btn btn-success w-100">
                    Adicionar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {tab === 'lista' && (
        <div className="table-responsive card border-0 shadow-sm">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Data</th>
                <th>Categoria</th>
                <th>Fornecedor</th>
                <th>Animal</th>
                <th>Valor</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.despesas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    Nenhuma despesa registrada.
                  </td>
                </tr>
              ) : (
                data.despesas.map((d) => (
                  <tr key={d.id}>
                    <td>{d.data}</td>
                    <td>{d.categoria}</td>
                    <td>{d.fornecedor}</td>
                    <td>{d.animal || '—'}</td>
                    <td className="text-danger fw-semibold">{formatBRL(d.valor)}</td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => excluirDespesa(d.id)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
