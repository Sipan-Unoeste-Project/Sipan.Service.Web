import { useState, useEffect } from 'react';
import PageShell from '../../../components/PageShell';
import ApacTabs from '../components/ApacTabs';
import { loadEstoque, saveEstoque } from '../storage/apacStorage';

const CATEGORIAS = [
  { value: 'alimentos', label: 'Alimentos' },
  { value: 'medicamentos', label: 'Medicamentos' },
  { value: 'limpeza', label: 'Limpeza' },
  { value: 'acessorios', label: 'Acessórios' },
];

const emptyForm = {
  nome: '',
  categoria: 'alimentos',
  qtde: '',
  unidade: 'unidades',
  validade: '',
  local: '',
};

export default function ApacEstoquePage() {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState('lista');
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setItems(loadEstoque());
  }, []);

  useEffect(() => {
    if (msg) {
      const t = setTimeout(() => setMsg(''), 3000);
      return () => clearTimeout(t);
    }
  }, [msg]);

  function persist(list) {
    setItems(list);
    saveEstoque(list);
  }

  function abrirForm(item = null) {
    if (item) {
      setEditando(item);
      setForm({
        nome: item.item,
        categoria: item.categoria,
        qtde: String(item.qtde),
        unidade: item.unidade,
        validade: item.validade,
        local: item.local,
      });
    } else {
      setEditando(null);
      setForm(emptyForm);
    }
    setTab('form');
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      item: form.nome,
      categoria: form.categoria,
      qtde: parseInt(form.qtde, 10),
      unidade: form.unidade,
      validade: form.validade,
      local: form.local,
      status: form.qtde <= 5 ? 'baixo' : 'normal',
    };

    if (editando) {
      persist(items.map((i) => (i.id === editando.id ? { ...i, ...payload } : i)));
      setMsg('Item atualizado.');
    } else {
      persist([...items, { id: Date.now(), ...payload }]);
      setMsg('Item adicionado.');
    }
    setTab('lista');
    setEditando(null);
    setForm(emptyForm);
  }

  function excluir(id) {
    if (!window.confirm('Excluir este item?')) return;
    persist(items.filter((i) => i.id !== id));
    setMsg('Item excluído.');
  }

  const baixo = items.filter((i) => i.qtde <= 5);
  const lista = tab === 'baixo' ? baixo : items;

  return (
    <PageShell
      title="Estoque"
      subtitle="Produtos, medicamentos e materiais do abrigo"
      action={
        <button type="button" className="btn btn-success" onClick={() => abrirForm()}>
          + Adicionar item
        </button>
      }
    >
      {msg && <div className="alert alert-success py-2">{msg}</div>}

      <ApacTabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'lista', label: 'Todos os itens' },
          { id: 'baixo', label: `Estoque baixo (${baixo.length})` },
          { id: 'form', label: editando ? 'Editar' : 'Novo item' },
        ]}
      />

      {tab === 'form' && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Nome</label>
                  <input
                    className="form-control"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Categoria</label>
                  <select
                    className="form-select"
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  >
                    {CATEGORIAS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Quantidade</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.qtde}
                    onChange={(e) => setForm({ ...form, qtde: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Unidade</label>
                  <select
                    className="form-select"
                    value={form.unidade}
                    onChange={(e) => setForm({ ...form, unidade: e.target.value })}
                  >
                    <option value="unidades">Unidades</option>
                    <option value="kg">Kg</option>
                    <option value="litros">Litros</option>
                    <option value="pacotes">Pacotes</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Validade</label>
                  <input
                    className="form-control"
                    placeholder="dd/mm/aaaa"
                    value={form.validade}
                    onChange={(e) => setForm({ ...form, validade: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Local</label>
                  <input
                    className="form-control"
                    value={form.local}
                    onChange={(e) => setForm({ ...form, local: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="d-flex gap-2 mt-3">
                <button type="submit" className="btn btn-success">
                  {editando ? 'Salvar' : 'Adicionar'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setTab('lista')}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {(tab === 'lista' || tab === 'baixo') && (
        <div className="table-responsive card border-0 shadow-sm">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Item</th>
                <th>Categoria</th>
                <th>Qtde</th>
                <th>Validade</th>
                <th>Local</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    Nenhum item encontrado.
                  </td>
                </tr>
              ) : (
                lista.map((item) => (
                  <tr key={item.id} className={item.qtde <= 5 ? 'table-warning' : ''}>
                    <td className="fw-medium">{item.item}</td>
                    <td>{item.categoria}</td>
                    <td>
                      {item.qtde} {item.unidade}
                    </td>
                    <td>{item.validade}</td>
                    <td>{item.local}</td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary me-1"
                        onClick={() => abrirForm(item)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => excluir(item.id)}
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
