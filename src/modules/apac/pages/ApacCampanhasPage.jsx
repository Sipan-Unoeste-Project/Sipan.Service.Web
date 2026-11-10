import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { ApiError } from '../../../api/client';
import { usePermissao } from '../../../hooks/usePermissao';
import * as campanhasApi from '../../../api/campanhasApi';
import { getDataAtualIso, toIsoDate } from '../../../utils/dates';
import { formatMoneyBr, maskMoneyBr } from '../../../utils/masks';
import PageShell from '../../../components/PageShell';
import ConfirmModal from '../../../components/ConfirmModal';
import DoacaoValorModal from '../../../components/DoacaoValorModal';
import DateInputBr from '../../../components/DateInputBr';
import ActionIconButtons from '../../../components/ActionIconButtons';
import FeedbackAlert from '../../../components/FeedbackAlert';
import { useTimedMessage } from '../../../hooks/useTimedMessage';
import { parseValor, formatBRL } from '../storage/apacStorage';

const DESCRICAO_MAX = 500;

function addDaysIso(iso, days) {
  const base = toIsoDate(iso) || getDataAtualIso();
  const d = new Date(`${base}T12:00:00`);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formNovoPadrao() {
  const hoje = getDataAtualIso();
  return {
    nome: '',
    descricao: '',
    dataInicio: hoje,
    dataFim: addDaysIso(hoje, 7),
    meta: '',
  };
}

const emptyForm = formNovoPadrao();

function isCampanhaAtiva(status) {
  return status === 'ativa' || status === 'planejada';
}

function diasRestantes(dataFim) {
  const fim = toIsoDate(dataFim);
  if (!fim) return null;
  const hoje = getDataAtualIso();
  const ms =
    new Date(`${fim}T12:00:00`).getTime() - new Date(`${hoje}T12:00:00`).getTime();
  return Math.ceil(ms / 86400000);
}

function labelDiasRestantes(dias) {
  if (dias == null) return null;
  if (dias < 0) return 'Prazo encerrado';
  if (dias === 0) return 'Encerra hoje';
  if (dias === 1) return 'Encerra amanhã';
  return `Encerra em ${dias} dias`;
}

export default function ApacCampanhasPage() {
  const location = useLocation();
  const { autenticado, podeRecurso } = usePermissao();
  const modoPublico =
    location.pathname.startsWith('/publico') ||
    !autenticado ||
    !podeRecurso('campanhas');
  const [dados, setDados] = useState({ ativas: [], encerradas: [] });
  const [loading, setLoading] = useState(true);
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
  const [salvando, setSalvando] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [datasAlteradas, setDatasAlteradas] = useState(false);

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

  const filtroAtivo = Boolean(
    filtro.nome.trim() || filtro.data || filtroStatus !== 'todas'
  );

  const chipsFiltro = useMemo(() => {
    const chips = [];
    if (filtro.nome.trim()) chips.push(`Nome: “${filtro.nome.trim()}”`);
    if (filtro.data) {
      const [y, m, d] = toIsoDate(filtro.data).split('-');
      chips.push(`Data: ${d}/${m}/${y}`);
    }
    if (filtroStatus === 'ativas') chips.push('Situação: Ativas');
    if (filtroStatus === 'encerradas') chips.push('Situação: Encerradas');
    return chips;
  }, [filtro, filtroStatus]);

  const listaFiltrada = useMemo(() => {
    const termo = filtro.nome.trim().toLowerCase();
    const dataFiltro = filtro.data ? toIsoDate(filtro.data) : '';

    const filtradas = todas.filter((c) => {
      const ativa = isCampanhaAtiva(c.status);
      if (filtroStatus === 'ativas' && !ativa) return false;
      if (filtroStatus === 'encerradas' && ativa) return false;

      if (termo && !(c.nome || '').toLowerCase().includes(termo)) return false;

      if (dataFiltro) {
        const inicio = c.dataInicio || '';
        const fim = c.dataFim || '';
        if (!inicio || !fim) return false;
        if (dataFiltro < inicio || dataFiltro > fim) return false;
      }

      return true;
    });

    return filtradas.sort((a, b) => {
      const aAtiva = isCampanhaAtiva(a.status) ? 0 : 1;
      const bAtiva = isCampanhaAtiva(b.status) ? 0 : 1;
      if (aAtiva !== bAtiva) return aAtiva - bAtiva;
      if (aAtiva === 0) {
        return String(a.dataFim || '').localeCompare(String(b.dataFim || ''));
      }
      return String(b.dataFim || '').localeCompare(String(a.dataFim || ''));
    });
  }, [todas, filtro, filtroStatus]);

  function limparFiltros() {
    setFiltro({ nome: '', data: '' });
    setFiltroStatus('todas');
  }

  function abrirForm(campanha = null) {
    setFormErrors({});
    setDatasAlteradas(false);
    if (campanha) {
      setEditando(campanha);
      setForm({
        nome: campanha.nome,
        descricao: campanha.descricao || '',
        dataInicio: toIsoDate(campanha.dataInicio) || getDataAtualIso(),
        dataFim: toIsoDate(campanha.dataFim || campanha.dataInicio) || getDataAtualIso(),
        meta: formatMoneyBr(campanha.meta),
      });
    } else {
      setEditando(null);
      setForm(formNovoPadrao());
    }
    setMostrarForm(true);
  }

  function fecharForm() {
    setMostrarForm(false);
    setEditando(null);
    setFormErrors({});
    setDatasAlteradas(false);
    setSalvando(false);
    setForm(formNovoPadrao());
  }

  function alterarDataInicio(iso) {
    setDatasAlteradas(true);
    setForm((prev) => {
      const inicio = toIsoDate(iso) || iso;
      let fim = toIsoDate(prev.dataFim) || prev.dataFim;
      if (!fim || fim < inicio) {
        fim = addDaysIso(inicio, 7);
      }
      return { ...prev, dataInicio: inicio, dataFim: fim };
    });
    setFormErrors((prev) => ({ ...prev, dataInicio: '', dataFim: '' }));
  }

  function alterarDataFim(iso) {
    setDatasAlteradas(true);
    setForm((prev) => ({ ...prev, dataFim: toIsoDate(iso) || iso }));
    setFormErrors((prev) => ({ ...prev, dataFim: '' }));
  }

  function validarFormulario() {
    const errs = {};
    if (!form.nome.trim()) errs.nome = 'Informe o nome da campanha.';
    const inicioIso = toIsoDate(form.dataInicio);
    const fimIso = toIsoDate(form.dataFim);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(inicioIso)) errs.dataInicio = 'Selecione a data de início.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fimIso)) errs.dataFim = 'Selecione a data de fim.';
    if (inicioIso && fimIso && fimIso < inicioIso) {
      errs.dataFim = 'A data de fim deve ser igual ou posterior à data de início.';
    }
    const metaNum = parseValor(form.meta);
    if (!form.meta || metaNum <= 0) errs.meta = 'Informe uma estimativa maior que zero.';
    if ((form.descricao || '').length > DESCRICAO_MAX) {
      errs.descricao = `A descrição pode ter no máximo ${DESCRICAO_MAX} caracteres.`;
    }
    return errs;
  }

  async function salvar(e) {
    e.preventDefault();
    const errs = validarFormulario();
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) {
      setErro('Revise os campos destacados.');
      return;
    }

    const inicioIso = toIsoDate(form.dataInicio);
    const fimIso = toIsoDate(form.dataFim);
    const body = campanhasApi.formToCampanhaBody(
      { ...form, dataInicio: inicioIso, dataFim: fimIso },
      editando?.status || 'ativa'
    );

    setSalvando(true);
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
      setFormErrors({});
      setDatasAlteradas(false);
      setForm(formNovoPadrao());
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao salvar campanha.');
    } finally {
      setSalvando(false);
    }
  }

  useEffect(() => {
    if (!mostrarForm) return undefined;
    function onKey(e) {
      if (e.key === 'Escape' && !salvando) fecharForm();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mostrarForm, salvando]);

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
    if (status === 'ativa') return 'bg-success';
    if (status === 'planejada') return 'text-bg-success';
    return 'bg-secondary';
  }

  const mesmoDia =
    datasAlteradas &&
    form.dataInicio &&
    form.dataFim &&
    toIsoDate(form.dataInicio) === toIsoDate(form.dataFim);
  const descLen = (form.descricao || '').length;

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
            <p className="text-muted small mb-3">
              Defina o período e a estimativa de arrecadação. Campos com * são obrigatórios.
            </p>
            <form onSubmit={salvar} noValidate>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="campanha-nome">
                    Nome <span className="text-danger">*</span>
                  </label>
                  <input
                    id="campanha-nome"
                    className={`form-control${formErrors.nome ? ' is-invalid' : ''}`}
                    value={form.nome}
                    onChange={(e) => {
                      setForm({ ...form, nome: e.target.value });
                      setFormErrors((prev) => ({ ...prev, nome: '' }));
                    }}
                    placeholder="Ex.: Campanha de ração de inverno"
                    maxLength={120}
                    disabled={salvando}
                  />
                  {formErrors.nome ? <div className="invalid-feedback">{formErrors.nome}</div> : null}
                </div>
                <div className="col-md-3">
                  <label className="form-label" htmlFor="campanha-data-inicio">
                    Data de início <span className="text-danger">*</span>
                  </label>
                  <DateInputBr
                    id="campanha-data-inicio"
                    value={form.dataInicio}
                    onChange={(e) => alterarDataInicio(e.target.value)}
                    className={`form-control${formErrors.dataInicio ? ' is-invalid' : ''}`}
                    disabled={salvando}
                  />
                  {formErrors.dataInicio ? (
                    <div className="invalid-feedback d-block">{formErrors.dataInicio}</div>
                  ) : (
                    <div className="form-text">Ao alterar o início, o fim se ajusta se ficar inválido.</div>
                  )}
                </div>
                <div className="col-md-3">
                  <label className="form-label" htmlFor="campanha-data-fim">
                    Data de fim <span className="text-danger">*</span>
                  </label>
                  <DateInputBr
                    id="campanha-data-fim"
                    value={form.dataFim}
                    min={form.dataInicio || undefined}
                    onChange={(e) => alterarDataFim(e.target.value)}
                    className={`form-control${formErrors.dataFim ? ' is-invalid' : ''}`}
                    disabled={salvando}
                  />
                  {formErrors.dataFim ? (
                    <div className="invalid-feedback d-block">{formErrors.dataFim}</div>
                  ) : (
                    <div className="form-text">Padrão: 7 dias após o início.</div>
                  )}
                </div>
                {mesmoDia ? (
                  <div className="col-12">
                    <div className="alert alert-warning py-2 mb-0 small">
                      Início e fim estão no mesmo dia. A campanha terá duração de um único dia.
                    </div>
                  </div>
                ) : null}
                <div className="col-md-4">
                  <label className="form-label" htmlFor="campanha-meta">
                    Estimativa de valor (R$) <span className="text-danger">*</span>
                  </label>
                  <input
                    id="campanha-meta"
                    className={`form-control${formErrors.meta ? ' is-invalid' : ''}`}
                    value={form.meta}
                    onChange={(e) => {
                      setForm({ ...form, meta: maskMoneyBr(e.target.value) });
                      setFormErrors((prev) => ({ ...prev, meta: '' }));
                    }}
                    placeholder="0,00"
                    inputMode="numeric"
                    disabled={salvando}
                  />
                  {formErrors.meta ? (
                    <div className="invalid-feedback">{formErrors.meta}</div>
                  ) : (
                    <div className="form-text">Pode ultrapassar a estimativa sem encerrar a campanha.</div>
                  )}
                </div>
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-baseline">
                    <label className="form-label" htmlFor="campanha-descricao">
                      Descrição
                    </label>
                    <span className={`small ${descLen > DESCRICAO_MAX ? 'text-danger' : 'text-muted'}`}>
                      {descLen}/{DESCRICAO_MAX}
                    </span>
                  </div>
                  <textarea
                    id="campanha-descricao"
                    className={`form-control${formErrors.descricao ? ' is-invalid' : ''}`}
                    rows={3}
                    value={form.descricao}
                    maxLength={DESCRICAO_MAX}
                    onChange={(e) => {
                      setForm({ ...form, descricao: e.target.value.slice(0, DESCRICAO_MAX) });
                      setFormErrors((prev) => ({ ...prev, descricao: '' }));
                    }}
                    placeholder="Objetivo, público ou detalhes da arrecadação (opcional)"
                    disabled={salvando}
                  />
                  {formErrors.descricao ? (
                    <div className="invalid-feedback">{formErrors.descricao}</div>
                  ) : null}
                </div>
              </div>
              <div className="d-flex gap-2 mt-3">
                <button type="submit" className="btn btn-success" disabled={salvando}>
                  {salvando ? 'Salvando…' : 'Salvar'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={fecharForm}
                  disabled={salvando}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <>
          <div className="d-flex flex-wrap gap-2 mb-2 align-items-center">
            <input
              type="search"
              className="form-control"
              style={{ maxWidth: 280 }}
              placeholder="Buscar por nome…"
              value={filtro.nome}
              onChange={(e) => setFiltro((prev) => ({ ...prev, nome: e.target.value }))}
              aria-label="Buscar por nome"
            />

            <div style={{ maxWidth: 220 }}>
              <DateInputBr
                value={filtro.data}
                onChange={(e) => setFiltro((prev) => ({ ...prev, data: e.target.value }))}
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

            {filtroAtivo ? (
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={limparFiltros}>
                Limpar filtros
              </button>
            ) : null}

            <span className="ms-auto text-muted small">
              {listaFiltrada.length}{' '}
              {listaFiltrada.length === 1 ? 'resultado' : 'resultados'}
            </span>
          </div>

          {filtroAtivo ? (
            <div className="mb-3 small text-muted">
              Filtrado por: {chipsFiltro.join(' · ')}
            </div>
          ) : null}

          <div className="row g-3">
            {loading ? (
              <div className="col-12 text-muted text-center py-4">Carregando...</div>
            ) : listaFiltrada.length === 0 ? (
              <div className="col-12 text-center py-5 text-muted">
                <p className="mb-1 fw-semibold">Nenhuma campanha encontrada.</p>
                <small className="d-block mb-3">
                  {filtroAtivo
                    ? 'Nenhum resultado para os filtros atuais.'
                    : 'Ainda não há campanhas cadastradas.'}
                </small>
                {filtroAtivo ? (
                  <button type="button" className="btn btn-sm btn-outline-success" onClick={limparFiltros}>
                    Limpar filtros
                  </button>
                ) : !modoPublico ? (
                  <button type="button" className="btn btn-sm btn-success" onClick={() => abrirForm()}>
                    Nova campanha
                  </button>
                ) : null}
              </div>
            ) : (
              listaFiltrada.map((c) => {
                const pct = c.meta > 0 ? Math.min(100, (c.arrecadado / c.meta) * 100) : 0;
                const podeDoar = isCampanhaAtiva(c.status);
                const encerrada = !podeDoar;
                const dias = podeDoar ? diasRestantes(c.dataFim) : null;
                const textoDias = labelDiasRestantes(dias);
                const descricao = (c.descricao || '').trim();

                return (
                  <div className="col-md-6" key={c.id}>
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                          <h5 className="fw-semibold mb-0">{c.nome}</h5>
                          <span className={`badge ${badgeClass(c.status)}`}>{c.statusLabel}</span>
                        </div>

                        {descricao ? (
                          <p className="text-muted small mb-2">{descricao}</p>
                        ) : null}

                        <p className="small mb-1">
                          Início: <strong>{c.dataInicioBr}</strong>
                          {' · '}
                          Fim: <strong>{c.dataFimBr}</strong>
                        </p>
                        {c.createdAtBr ? (
                          <p className="small text-muted mb-1">Criada em: {c.createdAtBr}</p>
                        ) : null}
                        {textoDias ? (
                          <p className="small text-success fw-semibold mb-2">{textoDias}</p>
                        ) : null}
                        {encerrada ? (
                          <p className="small text-muted mb-2">Campanha encerrada — doações indisponíveis.</p>
                        ) : null}

                        <div className="progress mb-2" style={{ height: pct > 0 ? 12 : 8 }}>
                          <div
                            className={`progress-bar ${pct > 0 ? 'bg-success' : 'bg-light'}`}
                            style={{ width: `${pct > 0 ? pct : 0}%` }}
                            role="progressbar"
                            aria-valuenow={pct}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                        <p className="small mb-3">
                          {pct <= 0 ? (
                            <span className="text-muted">Nenhuma doação ainda · meta {formatBRL(c.meta)}</span>
                          ) : (
                            <>
                              {formatBRL(c.arrecadado)} de {formatBRL(c.meta)} estimados ({pct.toFixed(0)}%)
                            </>
                          )}
                        </p>

                        <div className="mt-auto d-flex flex-wrap gap-1 align-items-center">
                          {!modoPublico && podeDoar ? (
                            <ActionIconButtons
                              onEdit={() => abrirForm(c)}
                              onDelete={() => setExcluirId(c.id)}
                            />
                          ) : null}
                          {!modoPublico && encerrada ? (
                            <ActionIconButtons onDelete={() => setExcluirId(c.id)} />
                          ) : null}
                          {podeDoar ? (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-success"
                              title="Doar para esta campanha"
                              aria-label="Doar para esta campanha"
                              onClick={() => setDoarCampanha(c)}
                            >
                              <i className="bi bi-currency-dollar" aria-hidden="true" />
                            </button>
                          ) : null}
                        </div>
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
