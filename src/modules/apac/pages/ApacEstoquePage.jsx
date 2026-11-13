import { useState, useEffect, useCallback, useMemo } from 'react';
import { ApiError } from '../../../api/client';
import * as estoqueApi from '../../../api/estoqueApi';
import FormSelect from '../../../components/FormSelect';
import PageShell from '../../../components/PageShell';
import ConfirmModal from '../../../components/ConfirmModal';
import ActionIconButtons from '../../../components/ActionIconButtons';
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
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [rascunho, setRascunho] = useState({ nome: '', categoria: '' });
  const [filtro, setFiltro] = useState({ nome: '', categoria: '' });
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [msg, setMsg] = useTimedMessage(3000);
  const [erro, setErro] = useTimedMessage(6000);
  const [excluirId, setExcluirId] = useState(null);
  const [historicoItem, setHistoricoItem] = useState(null);
  const [movimentos, setMovimentos] = useState([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  const [formMov, setFormMov] = useState({
    tipo: '',
    quantidade: '',
    justificativa: '',
  });

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const lista = await estoqueApi.listEstoque();
      setItems(lista.map(estoqueApi.mapEstoqueUi));
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar o estoque.'
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [setErro]);

  useEffect(() => {
    if (!mostrarForm) carregar();
  }, [carregar, mostrarForm]);

  const listaFiltrada = useMemo(() => {
    const termo = filtro.nome.trim().toLowerCase();
    return items.filter((item) => {
      if (filtroStatus === 'baixo' && item.status !== 'baixo') return false;
      if (filtro.categoria && item.categoria !== filtro.categoria) return false;
      if (
        termo &&
        !(item.item || '').toLowerCase().includes(termo) &&
        !(item.local || '').toLowerCase().includes(termo)
      ) {
        return false;
      }
      return true;
    });
  }, [items, filtro, filtroStatus]);

  function aplicarFiltros(e) {
    e?.preventDefault?.();
    setFiltro({ ...rascunho });
  }

  function limparFiltros() {
    const vazio = { nome: '', categoria: '' };
    setRascunho(vazio);
    setFiltro(vazio);
    setFiltroStatus('todos');
  }

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
    setFormMov({ tipo: '', quantidade: '', justificativa: '' });
    setMostrarForm(true);
  }

  function fecharForm() {
    setMostrarForm(false);
    setEditando(null);
    setForm(emptyForm);
    setFormMov({ tipo: '', quantidade: '', justificativa: '' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const body = estoqueApi.formToEstoqueBody(form);

    try {
      if (editando) {
        const tipo = formMov.tipo;
        const quantidade = parseInt(formMov.quantidade, 10);
        const justificativa = formMov.justificativa.trim();
        const querMovimentar = Boolean(tipo);

        if (querMovimentar) {
          if (!Number.isInteger(quantidade) || quantidade < 1) {
            setErro('Informe a quantidade da entrada/saída (inteiro maior que zero).');
            return;
          }
          if (justificativa.length < 5) {
            setErro('A justificativa é obrigatória para entrada/saída (mínimo 5 caracteres).');
            return;
          }
          if (tipo === 'saida' && quantidade > Number(editando.qtde)) {
            setErro(`Saída maior que o saldo atual (${editando.qtde}).`);
            return;
          }
        }

        await estoqueApi.updateEstoqueItem(editando.id, body);

        if (querMovimentar) {
          await estoqueApi.movimentarEstoque(editando.id, {
            tipo,
            quantidade,
            justificativa,
          });
          setMsg(
            tipo === 'entrada'
              ? 'Item atualizado e entrada registrada.'
              : 'Item atualizado e saída registrada.'
          );
        } else {
          setMsg('Item atualizado.');
        }
      } else {
        await estoqueApi.createEstoqueItem(body);
        setMsg('Item adicionado.');
      }
      fecharForm();
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao salvar item.');
    }
  }

  async function abrirHistorico(item) {
    setHistoricoItem(item);
    setCarregandoHistorico(true);
    setMovimentos([]);
    try {
      const lista = await estoqueApi.listMovimentosEstoque(item.id);
      setMovimentos(lista.map(estoqueApi.mapMovimentoUi));
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao carregar histórico.');
      setHistoricoItem(null);
    } finally {
      setCarregandoHistorico(false);
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

  return (
    <PageShell
      title="Estoque"
      subtitle="Produtos, medicamentos e materiais do abrigo"
      action={
        mostrarForm ? null : (
          <button type="button" className="btn btn-success" onClick={() => abrirForm()}>
            + Adicionar item
          </button>
        )
      }
    >
      <FeedbackAlert message={msg} />
      <FeedbackAlert message={erro} variant="danger" />

      {mostrarForm ? (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="fw-semibold mb-3">{editando ? 'Editar item' : 'Novo item'}</h5>
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
                  <FormSelect
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  >
                    {CATEGORIAS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </FormSelect>
                </div>
              </div>

              <div className="border rounded-3 p-3 mt-3">
                <h6 className="fw-semibold mb-3">
                  {editando ? 'Saldo e armazenamento' : 'Quantidade e armazenamento'}
                </h6>
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label">
                      {editando ? 'Saldo atual' : 'Quantidade inicial'}
                    </label>
                    <div className="input-group">
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={form.qtde}
                        onChange={(e) => setForm({ ...form, qtde: e.target.value })}
                        required={!editando}
                        readOnly={!!editando}
                        disabled={!!editando}
                      />
                      <span className="input-group-text">{form.unidade || 'unidades'}</span>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Unidade de medida</label>
                    <FormSelect
                      value={form.unidade}
                      onChange={(e) => setForm({ ...form, unidade: e.target.value })}
                    >
                      <option value="unidades">unidades</option>
                      <option value="kg">kg</option>
                      <option value="litros">litros</option>
                      <option value="pacotes">pacotes</option>
                    </FormSelect>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Validade</label>
                    <input
                      type="date"
                      className="form-control"
                      lang="pt-BR"
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

                {editando ? (
                  <div className="border-top pt-3 mt-3">
                    <h6 className="fw-semibold mb-1">Entrada / Saída</h6>
                    <p className="small text-muted mb-3">
                      Movimente em <strong>{form.unidade}</strong>. Justificativa obrigatória.
                    </p>
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label">Tipo</label>
                        <FormSelect
                          value={formMov.tipo}
                          onChange={(e) =>
                            setFormMov((prev) => ({ ...prev, tipo: e.target.value }))
                          }
                        >
                          <option value="">Sem movimentação</option>
                          <option value="entrada">Entrada</option>
                          <option value="saida">Saída</option>
                        </FormSelect>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">
                          Quantidade {formMov.tipo ? <span className="text-danger">*</span> : null}
                        </label>
                        <div className="input-group">
                          <input
                            type="number"
                            min="1"
                            className="form-control"
                            value={formMov.quantidade}
                            disabled={!formMov.tipo}
                            onChange={(e) =>
                              setFormMov((prev) => ({ ...prev, quantidade: e.target.value }))
                            }
                            required={Boolean(formMov.tipo)}
                          />
                          <span className="input-group-text">{form.unidade || 'unidades'}</span>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <label className="form-label">
                          Justificativa {formMov.tipo ? <span className="text-danger">*</span> : null}
                        </label>
                        <textarea
                          className="form-control"
                          rows={2}
                          maxLength={255}
                          disabled={!formMov.tipo}
                          placeholder="Ex.: Doação recebida / Uso em atendimento do animal"
                          value={formMov.justificativa}
                          onChange={(e) =>
                            setFormMov((prev) => ({ ...prev, justificativa: e.target.value }))
                          }
                          required={Boolean(formMov.tipo)}
                        />
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="d-flex gap-2 mt-3">
                <button type="submit" className="btn btn-success">
                  {editando ? 'Salvar' : 'Adicionar'}
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={fecharForm}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <>
          <form
            className="d-flex flex-wrap gap-2 mb-3 align-items-center"
            onSubmit={aplicarFiltros}
          >
            <input
              type="search"
              className="form-control"
              style={{ maxWidth: 260 }}
              placeholder="Buscar por nome ou local…"
              value={rascunho.nome}
              onChange={(e) => setRascunho((prev) => ({ ...prev, nome: e.target.value }))}
              aria-label="Buscar estoque"
            />
            <select
              className="form-select"
              style={{ maxWidth: 180 }}
              value={rascunho.categoria}
              onChange={(e) => setRascunho((prev) => ({ ...prev, categoria: e.target.value }))}
              aria-label="Filtrar por categoria"
            >
              <option value="">Todas as categorias</option>
              {CATEGORIAS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>

            <div className="btn-group flex-wrap" role="group" aria-label="Filtrar por situação">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'baixo', label: 'Estoque baixo' },
              ].map((opcao) => (
                <button
                  key={opcao.id}
                  type="button"
                  className={`btn btn-sm ${
                    filtroStatus === opcao.id ? 'btn-success' : 'btn-outline-secondary'
                  }`}
                  onClick={() => setFiltroStatus(opcao.id)}
                >
                  {opcao.label}
                </button>
              ))}
            </div>

            <button type="submit" className="btn btn-sm btn-success">
              Filtrar
            </button>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={limparFiltros}>
              Limpar
            </button>

            <span className="ms-auto text-muted small">
              {listaFiltrada.length}{' '}
              {listaFiltrada.length === 1 ? 'resultado' : 'resultados'}
            </span>
          </form>

          <div className="table-responsive card border-0 shadow-sm">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Item</th>
                  <th>Categoria</th>
                  <th>Qtde</th>
                  <th>Validade</th>
                  <th>Local</th>
                  <th>Última alteração</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">
                      Carregando...
                    </td>
                  </tr>
                ) : listaFiltrada.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-5">
                      <p className="mb-1 fw-semibold">Nenhum item encontrado.</p>
                      <small>Tente ajustar a busca ou o filtro.</small>
                    </td>
                  </tr>
                ) : (
                  listaFiltrada.map((item) => (
                    <tr key={item.id} className={item.status === 'baixo' ? 'table-warning' : ''}>
                      <td className="fw-medium">
                        {item.item}
                        {item.status === 'baixo' ? (
                          <span className="badge bg-warning text-dark ms-2">Baixo</span>
                        ) : null}
                      </td>
                      <td>{item.categoriaLabel}</td>
                      <td>
                        {item.qtde} {item.unidade}
                      </td>
                      <td>{item.validadeBr || '—'}</td>
                      <td>{item.local || '—'}</td>
                      <td className="small text-muted">
                        {item.atualizadoPor || '—'}
                        {item.atualizadoEmBr ? (
                          <>
                            <br />
                            {item.atualizadoEmBr}
                          </>
                        ) : null}
                      </td>
                      <td className="text-end">
                        <div className="d-inline-flex flex-wrap gap-1 justify-content-end">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            title="Histórico"
                            aria-label="Histórico"
                            onClick={() => abrirHistorico(item)}
                          >
                            <i className="bi bi-clock-history" aria-hidden="true" />
                          </button>
                          <ActionIconButtons
                            onEdit={() => abrirForm(item)}
                            onDelete={() => setExcluirId(item.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ConfirmModal
        show={!!excluirId}
        message="Deseja excluir este item do estoque?"
        onConfirm={confirmarExclusao}
        onCancel={() => setExcluirId(null)}
      />

      {historicoItem && (
        <>
          <div className="modal-backdrop fade show" />
          <div className="modal fade show d-block" tabIndex={-1} role="dialog">
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Histórico — {historicoItem.item}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Fechar"
                    onClick={() => setHistoricoItem(null)}
                  />
                </div>
                <div className="modal-body">
                  {carregandoHistorico ? (
                    <p className="text-muted mb-0">Carregando histórico...</p>
                  ) : movimentos.length === 0 ? (
                    <p className="text-muted mb-0">Nenhuma movimentação registrada.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Data/hora</th>
                            <th>Ação</th>
                            <th>Qtde</th>
                            <th>Usuário</th>
                            <th>Detalhe</th>
                          </tr>
                        </thead>
                        <tbody>
                          {movimentos.map((m) => (
                            <tr key={m.id}>
                              <td className="small">{m.createdAtBr}</td>
                              <td>{m.acaoLabel}</td>
                              <td className="small">
                                {m.quantidade_antes ?? '—'} → {m.quantidade_depois ?? '—'}
                              </td>
                              <td>{m.usuario_nome || '—'}</td>
                              <td className="small text-muted">{m.detalhe || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setHistoricoItem(null)}
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </PageShell>
  );
}
