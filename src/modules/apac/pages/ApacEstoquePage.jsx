import { useState, useEffect, useCallback } from 'react';
import { ApiError } from '../../../api/client';
import * as estoqueApi from '../../../api/estoqueApi';
import PageShell from '../../../components/PageShell';
import ApacTabs from '../components/ApacTabs';
import ConfirmModal from '../../../components/ConfirmModal';
import FeedbackAlert from '../../../components/FeedbackAlert';
import { useTimedMessage } from '../../../hooks/useTimedMessage';

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
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('lista');
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useTimedMessage(3000);
  const [erro, setErro] = useTimedMessage(6000);
  const [excluirId, setExcluirId] = useState(null);

  const carregar = useCallback(async () => {
    if (tab === 'form') return;
    setLoading(true);
    try {
      const params = tab === 'baixo' ? { status: 'baixo' } : {};
      const lista = await estoqueApi.listEstoque(params);
      setItems(lista.map(estoqueApi.mapEstoqueUi));
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar o estoque. Execute database/apac_schema.sql se necessário.'
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [tab, setErro]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function abrirForm(item = null) {
    if (item) {
      setEditando(item);
      setForm({
        nome: item.item,
        categoria: item.categoria,
        qtde: String(item.qtde),
        unidade: item.unidade,
        validade: item.validade || '',
        local: item.local || '',
      });
    } else {
      setEditando(null);
      setForm(emptyForm);
    }
    setTab('form');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const body = estoqueApi.formToEstoqueBody(form);

    try {
      if (editando) {
        await estoqueApi.updateEstoqueItem(editando.id, body);
        setMsg('Item atualizado.');
      } else {
        await estoqueApi.createEstoqueItem(body);
        setMsg('Item adicionado.');
      }
      setTab('lista');
      setEditando(null);
      setForm(emptyForm);
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao salvar item.');
    }
  }

  async function confirmarExclusao() {
    if (!excluirId) return;
    try {
      await estoqueApi.deleteEstoqueItem(excluirId);
      setExcluirId(null);
      setMsg('Item excluído.');
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao excluir item.');
      setExcluirId(null);
    }
  }

  const lista = items;

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
      <FeedbackAlert message={msg} />
      <FeedbackAlert message={erro} variant="danger" />

      <ApacTabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'lista', label: 'Todos os itens' },
          { id: 'baixo', label: 'Estoque baixo' },
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
                    min="0"
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
                    <option value="unidades">unidades</option>
                    <option value="kg">kg</option>
                    <option value="litros">litros</option>
                    <option value="pacotes">pacotes</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Validade</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.validade}
                    onChange={(e) => setForm({ ...form, validade: e.target.value })}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Local</label>
                  <input
                    className="form-control"
                    value={form.local}
                    onChange={(e) => setForm({ ...form, local: e.target.value })}
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    Carregando...
                  </td>
                </tr>
              ) : lista.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    Nenhum item encontrado.
                  </td>
                </tr>
              ) : (
                lista.map((item) => (
                  <tr key={item.id} className={item.status === 'baixo' ? 'table-warning' : ''}>
                    <td className="fw-medium">{item.item}</td>
                    <td>{item.categoria}</td>
                    <td>
                      {item.qtde} {item.unidade}
                    </td>
                    <td>{item.validade || '—'}</td>
                    <td>{item.local || '—'}</td>
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
                        onClick={() => setExcluirId(item.id)}
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

      <ConfirmModal
        show={!!excluirId}
        message="Deseja excluir este item do estoque?"
        onConfirm={confirmarExclusao}
        onCancel={() => setExcluirId(null)}
      />
    </PageShell>
  );
}
