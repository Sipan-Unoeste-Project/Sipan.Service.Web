import { useState, useEffect, useCallback } from 'react';
import { ApiError } from '../../../api/client';
import * as despesasApi from '../../../api/despesasApi';
import { getDataAtualIso } from '../../../utils/dates';
import PageShell from '../../../components/PageShell';
import ApacTabs from '../components/ApacTabs';
import ConfirmModal from '../../../components/ConfirmModal';
import FeedbackAlert from '../../../components/FeedbackAlert';
import { useTimedMessage } from '../../../hooks/useTimedMessage';
import { parseValor, formatBRL } from '../storage/apacStorage';

const emptyDespesa = {
  categoria: 'Veterinário',
  valor: '',
  data: getDataAtualIso(),
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
  const [msg, setMsg] = useTimedMessage(3000);
  const [erro, setErro] = useTimedMessage(6000);
  const [excluirId, setExcluirId] = useState(null);

  const carregar = useCallback(async () => {
    try {
      const raw = await despesasApi.loadDespesas();
      setData(despesasApi.mapDespesasUi(raw));
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar despesas. Execute database/apac_extended_schema.sql.'
      );
    }
  }, [setErro]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function salvarDespesa(e) {
    e.preventDefault();
    try {
      await despesasApi.createDespesa({
        ...form,
        valor: parseValor(form.valor),
      });
      setForm({ ...emptyDespesa, data: getDataAtualIso() });
      setMsg('Despesa registrada.');
      setTab('lista');
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao registrar despesa.');
    }
  }

  async function salvarCategoria(e) {
    e.preventDefault();
    try {
      await despesasApi.createCategoria(novaCat);
      setNovaCat({ nome: '', descricao: '', icone: '📁' });
      setMsg('Categoria adicionada.');
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao adicionar categoria.');
    }
  }

  async function confirmarExclusao() {
    if (!excluirId) return;
    try {
      await despesasApi.deleteDespesa(excluirId);
      setExcluirId(null);
      setMsg('Despesa excluída.');
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao excluir despesa.');
      setExcluirId(null);
    }
  }

  return (
    <PageShell title="Despesas" subtitle="Categorias e gastos do abrigo">
      <FeedbackAlert message={msg} />
      <FeedbackAlert message={erro} variant="danger" />

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
                    type="date"
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
                        onClick={() => setExcluirId(d.id)}
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
        message="Deseja excluir esta despesa?"
        onConfirm={confirmarExclusao}
        onCancel={() => setExcluirId(null)}
      />
    </PageShell>
  );
}
