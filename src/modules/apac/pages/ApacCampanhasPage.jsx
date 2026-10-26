import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { ApiError } from '../../../api/client';
import { usePermissao } from '../../../hooks/usePermissao';
import * as campanhasApi from '../../../api/campanhasApi';
import { getDataAtualIso, toIsoDate } from '../../../utils/dates';
import PageShell from '../../../components/PageShell';
import ConfirmModal from '../../../components/ConfirmModal';
import DoacaoValorModal from '../../../components/DoacaoValorModal';
import DateInputBr from '../../../components/DateInputBr';
import ActionIconButtons from '../../../components/ActionIconButtons';
import FeedbackAlert from '../../../components/FeedbackAlert';
import { useTimedMessage } from '../../../hooks/useTimedMessage';
import { parseValor, formatBRL } from '../storage/apacStorage';

const emptyForm = {
  nome: '',
  descricao: '',
  dataInicio: getDataAtualIso(),
  dataFim: getDataAtualIso(),
  meta: '',
};

export default function ApacCampanhasPage() {
  const location = useLocation();
  const { autenticado, podeRecurso } = usePermissao();
  const modoPublico =
    location.pathname.startsWith('/publico') ||
    !autenticado ||
    !podeRecurso('campanhas');
  const [dados, setDados] = useState({ ativas: [], encerradas: [] });
  const [loading, setLoading] = useState(true);
  const [rascunho, setRascunho] = useState({ nome: '', data: '' });
  const [filtro, setFiltro] = useState({ nome: '', data: '' });
  const [filtroStatus, setFiltroStatus] = useState('todas');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useTimedMessage(3000);
  const [erro, setErro] = useTimedMessage(6000);
  const [excluirId, setExcluirId] = useState(null);
  const [doarCampanha, setDoarCampanha] = useState(null);
  const [salvandoDoacao, setSalvandoDoacao] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await campanhasApi.listCampanhas();
      setDados({
        ativas: (res.ativas || []).map(campanhasApi.mapCampanhaUi),
        encerradas: (res.encerradas || []).map(campanhasApi.mapCampanhaUi),
      });
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar campanhas. Execute database/apac_schema.sql se necessário.'
      );
      setDados({ ativas: [], encerradas: [] });
    } finally {
      setLoading(false);
    }
  }, [setErro]);

  useEffect(() => {
    if (!mostrarForm) carregar();
  }, [carregar, mostrarForm]);

  const todas = useMemo(
    () => [...dados.ativas, ...dados.encerradas],
    [dados.ativas, dados.encerradas]
  );

  const listaFiltrada = useMemo(() => {
    const termo = filtro.nome.trim().toLowerCase();
    const dataFiltro = filtro.data ? toIsoDate(filtro.data) : '';

    return todas.filter((c) => {
      const isAtiva = c.status === 'planejada' || c.status === 'ativa';
      if (filtroStatus === 'ativas' && !isAtiva) return false;
      if (filtroStatus === 'encerradas' && isAtiva) return false;

      if (termo && !(c.nome || '').toLowerCase().includes(termo)) return false;

      if (dataFiltro) {
        const inicio = c.dataInicio || '';
        const fim = c.dataFim || '';
        if (!inicio || !fim) return false;
        if (dataFiltro < inicio || dataFiltro > fim) return false;
      }

      return true;
    });
  }, [todas, filtro, filtroStatus]);

  function aplicarFiltros(e) {
    e?.preventDefault?.();
    setFiltro({ ...rascunho });
  }

  function limparFiltros() {
    const vazio = { nome: '', data: '' };
    setRascunho(vazio);
    setFiltro(vazio);
    setFiltroStatus('todas');
  }

  function abrirForm(campanha = null) {
    if (campanha) {
      setEditando(campanha);
      setForm({
        nome: campanha.nome,
        descricao: campanha.descricao || '',
        dataInicio: toIsoDate(campanha.dataInicio) || getDataAtualIso(),
        dataFim: toIsoDate(campanha.dataFim || campanha.dataInicio) || getDataAtualIso(),
        meta: String(campanha.meta),
      });
    } else {
      setEditando(null);
      const hoje = getDataAtualIso();
      setForm({ ...emptyForm, dataInicio: hoje, dataFim: hoje });
    }
    setMostrarForm(true);
  }

  function fecharForm() {
    setMostrarForm(false);
    setEditando(null);
    const hoje = getDataAtualIso();
    setForm({ ...emptyForm, dataInicio: hoje, dataFim: hoje });
  }

  async function salvar(e) {
    e.preventDefault();
    const inicioIso = toIsoDate(form.dataInicio);
    const fimIso = toIsoDate(form.dataFim);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(inicioIso) || !/^\d{4}-\d{2}-\d{2}$/.test(fimIso)) {
      setErro('Selecione a data de início e a data de fim.');
      return;
    }
    if (fimIso < inicioIso) {
      setErro('A data de fim deve ser igual ou posterior à data de início.');
      return;
    }

    const body = campanhasApi.formToCampanhaBody(
      { ...form, dataInicio: inicioIso, dataFim: fimIso },
      editando?.status || 'ativa'
    );

    try {
      if (editando) {
        await campanhasApi.updateCampanha(editando.id, body);
        setMsg('Campanha atualizada.');
      } else {
        await campanhasApi.createCampanha(body);
        setMsg('Campanha criada.');
      }
      setMostrarForm(false);
      setEditando(null);
      const hoje = getDataAtualIso();
      setForm({ ...emptyForm, dataInicio: hoje, dataFim: hoje });
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao salvar campanha.');
    }
  }

  async function confirmarExclusao() {
    if (!excluirId) return;
    try {
      await campanhasApi.deleteCampanha(excluirId);
      setExcluirId(null);
      setMsg('Campanha excluída.');
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao excluir campanha.');
      setExcluirId(null);
    }
  }

  async function confirmarDoacao(valorDigitado) {
    if (!doarCampanha || salvandoDoacao) return;
    const v = parseValor(valorDigitado);
    if (v <= 0) {
      setErro('Informe um valor positivo.');
      return;
    }
    setSalvandoDoacao(true);
    try {
      await campanhasApi.registrarDoacaoCampanha(doarCampanha.id, v);
      setDoarCampanha(null);
      setMsg(`Doação de ${formatBRL(v)} registrada.`);
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao registrar doação.');
    } finally {
      setSalvandoDoacao(false);
    }
  }

  function badgeClass(status) {
    if (status === 'ativa' || status === 'planejada') return 'bg-success';
    if (status === 'cancelada') return 'bg-secondary';
    return 'bg-dark';
  }

  return (
    <PageShell
      title="Campanhas"
      subtitle="Eventos e metas de arrecadação"
      action={
        modoPublico || mostrarForm ? null : (
          <button type="button" className="btn btn-success" onClick={() => abrirForm()}>
            Nova Campanha
          </button>
        )
      }
    >
      <FeedbackAlert message={msg} />
      <FeedbackAlert message={erro} variant="danger" />

      {mostrarForm ? (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="fw-semibold mb-3">{editando ? 'Editar campanha' : 'Nova campanha'}</h5>
            <form onSubmit={salvar}>
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
                <div className="col-md-3">
                  <label className="form-label" htmlFor="campanha-data-inicio">
                    Data de início
                  </label>
                  <DateInputBr
                    id="campanha-data-inicio"
                    value={form.dataInicio}
                    onChange={(e) => setForm({ ...form, dataInicio: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label" htmlFor="campanha-data-fim">
                    Data de fim
                  </label>
                  <DateInputBr
                    id="campanha-data-fim"
                    value={form.dataFim}
                    min={form.dataInicio || undefined}
                    onChange={(e) => setForm({ ...form, dataFim: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Estimativa de valor (R$)</label>
                  <input
                    className="form-control"
                    value={form.meta}
                    onChange={(e) => setForm({ ...form, meta: e.target.value })}
                    placeholder="Ex.: 5000,00"
                    required
                  />
                  <div className="form-text">Pode ultrapassar a estimativa sem encerrar a campanha.</div>
                </div>
                <div className="col-12">
                  <label className="form-label">Descrição</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={form.descricao}
                    onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  />
                </div>
              </div>
              <div className="d-flex gap-2 mt-3">
                <button type="submit" className="btn btn-success">
                  Salvar
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
              style={{ maxWidth: 280 }}
              placeholder="Buscar por nome…"
              value={rascunho.nome}
              onChange={(e) => setRascunho((prev) => ({ ...prev, nome: e.target.value }))}
              aria-label="Buscar por nome"
            />

            <div style={{ maxWidth: 220 }}>
              <DateInputBr
                value={rascunho.data}
                onChange={(e) => setRascunho((prev) => ({ ...prev, data: e.target.value }))}
                title="Campanhas em andamento nesta data"
                aria-label="Filtrar por data"
              />
            </div>

            <div className="btn-group flex-wrap" role="group" aria-label="Filtrar por situação">
              {[
                { id: 'todas', label: 'Todas' },
                { id: 'ativas', label: 'Ativas' },
                { id: 'encerradas', label: 'Encerradas' },
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

          <div className="row g-3">
            {loading ? (
              <div className="col-12 text-muted text-center py-4">Carregando...</div>
            ) : listaFiltrada.length === 0 ? (
              <div className="col-12 text-center py-5 text-muted">
                <p className="mb-1 fw-semibold">Nenhuma campanha encontrada.</p>
                <small>Tente ajustar a busca ou o filtro.</small>
              </div>
            ) : (
              listaFiltrada.map((c) => {
                const pct = c.meta > 0 ? Math.min(100, (c.arrecadado / c.meta) * 100) : 0;
                const podeDoar = c.status === 'ativa' || c.status === 'planejada';
                return (
                  <div className="col-md-6" key={c.id}>
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="fw-semibold mb-0">{c.nome}</h5>
                          <span className={`badge ${badgeClass(c.status)}`}>{c.statusLabel}</span>
                        </div>
                        <p className="text-muted small">{c.descricao}</p>
                        <p className="small mb-1">
                          Início: <strong>{c.dataInicioBr}</strong>
                          {' · '}
                          Fim: <strong>{c.dataFimBr}</strong>
                        </p>
                        {c.createdAtBr ? (
                          <p className="small text-muted mb-2">Criada em: {c.createdAtBr}</p>
                        ) : null}
                        <div className="progress mb-2" style={{ height: 8 }}>
                          <div
                            className="progress-bar bg-success"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="small mb-3">
                          {formatBRL(c.arrecadado)} de {formatBRL(c.meta)} estimados ({pct.toFixed(0)}%)
                        </p>
                        {(!modoPublico || podeDoar) && (
                          <div className="d-flex flex-wrap gap-1 align-items-center">
                            {!modoPublico && (
                              <ActionIconButtons
                                onEdit={() => abrirForm(c)}
                                onDelete={() => setExcluirId(c.id)}
                              />
                            )}
                            {podeDoar && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-success"
                                title="Doar"
                                aria-label="Doar"
                                onClick={() => setDoarCampanha(c)}
                              >
                                <i className="bi bi-currency-dollar" aria-hidden="true" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      <ConfirmModal
        show={!!excluirId}
        message="Deseja excluir esta campanha?"
        onConfirm={confirmarExclusao}
        onCancel={() => setExcluirId(null)}
      />

      <DoacaoValorModal
        show={!!doarCampanha}
        campanhaNome={doarCampanha?.nome}
        onConfirm={confirmarDoacao}
        onCancel={() => {
          if (!salvandoDoacao) setDoarCampanha(null);
        }}
      />
    </PageShell>
  );
}
