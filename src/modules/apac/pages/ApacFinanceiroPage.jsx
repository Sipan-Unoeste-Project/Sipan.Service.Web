import { useState, useEffect, useCallback, useMemo } from 'react';
import { ApiError } from '../../../api/client';
import * as financeiroApi from '../../../api/financeiroApi';
import * as campanhasApi from '../../../api/campanhasApi';
import { getDataAtualIso, toIsoDate } from '../../../utils/dates';
import { maskMoneyBr } from '../../../utils/masks';
import FormSelect from '../../../components/FormSelect';
import PageShell from '../../../components/PageShell';
import DateInputBr from '../../../components/DateInputBr';
import ConfirmModal from '../../../components/ConfirmModal';
import ApacTabs from '../components/ApacTabs';
import StatRow from '../components/StatRow';
import FeedbackAlert from '../../../components/FeedbackAlert';
import { useTimedMessage } from '../../../hooks/useTimedMessage';
import { parseValor, formatBRL } from '../storage/apacStorage';

const OBS_MAX = 500;

const emptyEntrada = () => ({
  origem: 'Doação em dinheiro',
  valor: '',
  data: getDataAtualIso(),
  responsavel: '',
  campanhaId: '',
  observacoes: '',
  comprovante: '',
});

const emptySaida = () => ({
  tipo: 'Veterinário',
  valor: '',
  data: getDataAtualIso(),
  fornecedor: '',
  animal: '',
  observacoes: '',
  comprovante: '',
});

export default function ApacFinanceiroPage() {
  const [data, setData] = useState({ entradas: [], saidas: [] });
  const [campanhas, setCampanhas] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [busca, setBusca] = useState('');
  const [dataDe, setDataDe] = useState('');
  const [dataAte, setDataAte] = useState('');
  const [formulario, setFormulario] = useState(null);
  const [formE, setFormE] = useState(emptyEntrada);
  const [formS, setFormS] = useState(emptySaida);
  const [formErrors, setFormErrors] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [anulando, setAnulando] = useState(null);
  const [motivoAnulacao, setMotivoAnulacao] = useState('');
  const [msg, setMsg] = useTimedMessage(3000);
  const [erro, setErro] = useTimedMessage(6000);

  const carregar = useCallback(async () => {
    try {
      const raw = await financeiroApi.loadFinanceiro();
      setData(financeiroApi.mapFinanceiroUi(raw));
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar financeiro. Execute database/apac_extended_schema.sql.'
      );
    }
  }, [setErro]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    if (formulario !== 'entrada') return undefined;
    let ativo = true;
    campanhasApi
      .listCampanhas()
      .then((res) => {
        if (!ativo) return;
        const lista = [
          ...(res?.ativas || []),
          ...(res?.encerradas || []),
        ].map((c) => ({ id: c.id, nome: c.nome }));
        setCampanhas(lista);
      })
      .catch(() => {
        if (ativo) setCampanhas([]);
      });
    return () => {
      ativo = false;
    };
  }, [formulario]);

  const historico = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return [
      ...data.entradas.map((x) => ({ ...x, kind: 'entrada' })),
      ...data.saidas.map((x) => ({ ...x, kind: 'saida' })),
    ]
      .filter((l) => filtro === 'todos' || l.kind === filtro)
      .filter((l) => !l.anulado)
      .filter((l) => {
        if (dataDe && l.dataIso && l.dataIso < dataDe) return false;
        if (dataAte && l.dataIso && l.dataIso > dataAte) return false;
        return true;
      })
      .filter((l) => {
        if (!q) return true;
        const hay = [
          l.origem,
          l.tipo,
          l.responsavel,
          l.fornecedor,
          l.animal,
          l.campanha,
          l.observacoes,
          l.comprovante,
          l.criadoPor,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => {
        if (a.dataIso !== b.dataIso) return (b.dataIso || '').localeCompare(a.dataIso || '');
        return b.id - a.id;
      });
  }, [data, filtro, busca, dataDe, dataAte]);

  const totalEntrada = historico.filter((l) => l.kind === 'entrada').reduce((s, e) => s + e.valor, 0);
  const totalSaida = historico.filter((l) => l.kind === 'saida').reduce((s, e) => s + e.valor, 0);
  const saldo = totalEntrada - totalSaida;
  const filtrosAtivos = Boolean(busca.trim() || dataDe || dataAte || filtro !== 'todos');

  function abrirEntrada() {
    setFormErrors({});
    setFormE(emptyEntrada());
    setFormulario('entrada');
  }

  function abrirSaida() {
    setFormErrors({});
    setFormS(emptySaida());
    setFormulario('saida');
  }

  function fecharFormulario() {
    if (salvando) return;
    setFormulario(null);
    setFormErrors({});
  }

  function validarEntrada() {
    const errs = {};
    if (!formE.origem.trim()) errs.origem = 'Selecione a origem.';
    if (parseValor(formE.valor) <= 0) errs.valor = 'Informe um valor maior que zero.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(toIsoDate(formE.data))) errs.data = 'Informe a data.';
    if (!formE.responsavel.trim()) errs.responsavel = 'Informe o doador ou responsável.';
    if ((formE.observacoes || '').length > OBS_MAX) {
      errs.observacoes = `Observações no máximo ${OBS_MAX} caracteres.`;
    }
    return errs;
  }

  function validarSaida() {
    const errs = {};
    if (!formS.tipo.trim()) errs.tipo = 'Selecione o tipo.';
    if (parseValor(formS.valor) <= 0) errs.valor = 'Informe um valor maior que zero.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(toIsoDate(formS.data))) errs.data = 'Informe a data.';
    if (!formS.fornecedor.trim()) errs.fornecedor = 'Informe o fornecedor.';
    if ((formS.observacoes || '').length > OBS_MAX) {
      errs.observacoes = `Observações no máximo ${OBS_MAX} caracteres.`;
    }
    return errs;
  }

  async function registrarEntrada(e) {
    e.preventDefault();
    const errs = validarEntrada();
    setFormErrors(errs);
    if (Object.keys(errs).length) {
      setErro('Revise os campos destacados.');
      return;
    }
    setSalvando(true);
    try {
      await financeiroApi.createEntrada({
        ...formE,
        valor: parseValor(formE.valor),
        campanhaId: formE.campanhaId ? Number(formE.campanhaId) : null,
      });
      setFormE(emptyEntrada());
      setFormulario(null);
      setFiltro('todos');
      setMsg('Entrada registrada.');
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao registrar entrada.');
    } finally {
      setSalvando(false);
    }
  }

  async function registrarSaida(e) {
    e.preventDefault();
    const errs = validarSaida();
    setFormErrors(errs);
    if (Object.keys(errs).length) {
      setErro('Revise os campos destacados.');
      return;
    }
    setSalvando(true);
    try {
      await financeiroApi.createSaida({
        ...formS,
        valor: parseValor(formS.valor),
      });
      setFormS(emptySaida());
      setFormulario(null);
      setFiltro('todos');
      setMsg('Saída registrada.');
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao registrar saída.');
    } finally {
      setSalvando(false);
    }
  }

  async function confirmarAnulacao() {
    const motivo = motivoAnulacao.trim();
    if (!motivo) {
      setErro('Informe o motivo da anulação.');
      return;
    }
    try {
      if (anulando.kind === 'entrada') {
        await financeiroApi.anularEntrada(anulando.id, motivo);
      } else {
        await financeiroApi.anularSaida(anulando.id, motivo);
      }
      setAnulando(null);
      setMotivoAnulacao('');
      setMsg('Lançamento anulado.');
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao anular lançamento.');
    }
  }

  function limparFiltros() {
    setBusca('');
    setDataDe('');
    setDataAte('');
    setFiltro('todos');
  }

  return (
    <PageShell
      title="Financeiro"
      subtitle="Controle de entradas e saídas de caixa"
      action={
        !formulario ? (
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="btn btn-success btn-no-hover" onClick={abrirEntrada}>
              Nova Entrada
            </button>
            <button type="button" className="btn btn-danger btn-no-hover" onClick={abrirSaida}>
              Nova Saída
            </button>
          </div>
        ) : null
      }
    >
      <FeedbackAlert message={msg} />
      <FeedbackAlert message={erro} variant="danger" />

      <StatRow
        items={[
          { label: 'Entradas', value: formatBRL(totalEntrada), valueClass: 'text-success' },
          { label: 'Saídas', value: formatBRL(totalSaida), valueClass: 'text-danger' },
          {
            label: 'Saldo',
            value: formatBRL(saldo),
            valueClass: saldo >= 0 ? 'text-success' : 'text-danger',
            sub: saldo >= 0 ? 'Positivo' : 'Negativo',
          },
        ]}
      />
      {filtrosAtivos ? (
        <p className="small text-muted mb-3">Totais conforme o filtro atual.</p>
      ) : null}

      {formulario === 'entrada' && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="fw-semibold mb-2">Nova entrada</h5>
            <p className="text-muted small mb-3">Campos com * são obrigatórios.</p>
            <form onSubmit={registrarEntrada} noValidate>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label" htmlFor="fin-origem">
                    Origem <span className="text-danger">*</span>
                  </label>
                  <FormSelect
                    id="fin-origem"
                    value={formE.origem}
                    onChange={(e) => setFormE({ ...formE, origem: e.target.value })}
                    disabled={salvando}
                  >
                    <option>Doação em dinheiro</option>
                    <option>Evento / Campanha</option>
                    <option>Patrocínio</option>
                    <option>Outro</option>
                  </FormSelect>
                </div>
                <div className="col-md-4">
                  <label className="form-label" htmlFor="fin-entrada-valor">
                    Valor (R$) <span className="text-danger">*</span>
                  </label>
                  <input
                    id="fin-entrada-valor"
                    className={`form-control${formErrors.valor ? ' is-invalid' : ''}`}
                    value={formE.valor}
                    onChange={(e) => {
                      setFormE({ ...formE, valor: maskMoneyBr(e.target.value) });
                      setFormErrors((p) => ({ ...p, valor: '' }));
                    }}
                    placeholder="0,00"
                    inputMode="numeric"
                    disabled={salvando}
                  />
                  {formErrors.valor ? <div className="invalid-feedback">{formErrors.valor}</div> : null}
                </div>
                <div className="col-md-4">
                  <label className="form-label" htmlFor="fin-entrada-data">
                    Data <span className="text-danger">*</span>
                  </label>
                  <DateInputBr
                    id="fin-entrada-data"
                    value={formE.data}
                    onChange={(e) => {
                      setFormE({ ...formE, data: e.target.value });
                      setFormErrors((p) => ({ ...p, data: '' }));
                    }}
                    className={`form-control${formErrors.data ? ' is-invalid' : ''}`}
                    disabled={salvando}
                  />
                  {formErrors.data ? (
                    <div className="invalid-feedback d-block">{formErrors.data}</div>
                  ) : null}
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="fin-responsavel">
                    Doador / Responsável <span className="text-danger">*</span>
                  </label>
                  <input
                    id="fin-responsavel"
                    className={`form-control${formErrors.responsavel ? ' is-invalid' : ''}`}
                    value={formE.responsavel}
                    onChange={(e) => {
                      setFormE({ ...formE, responsavel: e.target.value });
                      setFormErrors((p) => ({ ...p, responsavel: '' }));
                    }}
                    placeholder="Nome de quem doou ou respondeu pela entrada"
                    disabled={salvando}
                  />
                  {formErrors.responsavel ? (
                    <div className="invalid-feedback">{formErrors.responsavel}</div>
                  ) : null}
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="fin-campanha">
                    Campanha (opcional)
                  </label>
                  <FormSelect
                    id="fin-campanha"
                    value={formE.campanhaId}
                    onChange={(e) => setFormE({ ...formE, campanhaId: e.target.value })}
                    disabled={salvando}
                  >
                    <option value="">Sem vínculo</option>
                    {campanhas.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </FormSelect>
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="fin-entrada-comp">
                    Comprovante (opcional)
                  </label>
                  <input
                    id="fin-entrada-comp"
                    className="form-control"
                    value={formE.comprovante}
                    onChange={(e) => setFormE({ ...formE, comprovante: e.target.value })}
                    placeholder="Nº do recibo, PIX ou link"
                    maxLength={255}
                    disabled={salvando}
                  />
                </div>
                <div className="col-12">
                  <div className="d-flex justify-content-between">
                    <label className="form-label" htmlFor="fin-entrada-obs">
                      Observações
                    </label>
                    <span className="small text-muted">
                      {(formE.observacoes || '').length}/{OBS_MAX}
                    </span>
                  </div>
                  <textarea
                    id="fin-entrada-obs"
                    className={`form-control${formErrors.observacoes ? ' is-invalid' : ''}`}
                    rows={3}
                    value={formE.observacoes}
                    maxLength={OBS_MAX}
                    onChange={(e) => setFormE({ ...formE, observacoes: e.target.value })}
                    placeholder="Detalhes úteis para conferência e auditoria"
                    disabled={salvando}
                  />
                  {formErrors.observacoes ? (
                    <div className="invalid-feedback">{formErrors.observacoes}</div>
                  ) : null}
                </div>
              </div>
              <div className="d-flex gap-2 mt-3">
                <button type="submit" className="btn btn-success" disabled={salvando}>
                  {salvando ? 'Salvando…' : 'Salvar entrada'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={fecharFormulario}
                  disabled={salvando}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {formulario === 'saida' && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="fw-semibold mb-2">Nova saída</h5>
            <p className="text-muted small mb-3">Campos com * são obrigatórios.</p>
            <form onSubmit={registrarSaida} noValidate>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label" htmlFor="fin-tipo">
                    Tipo de despesa <span className="text-danger">*</span>
                  </label>
                  <FormSelect
                    id="fin-tipo"
                    value={formS.tipo}
                    onChange={(e) => setFormS({ ...formS, tipo: e.target.value })}
                    disabled={salvando}
                  >
                    <option>Veterinário</option>
                    <option>Alimentação / Ração</option>
                    <option>Medicamentos</option>
                    <option>Material de limpeza</option>
                    <option>Transporte</option>
                    <option>Outro</option>
                  </FormSelect>
                </div>
                <div className="col-md-4">
                  <label className="form-label" htmlFor="fin-saida-valor">
                    Valor (R$) <span className="text-danger">*</span>
                  </label>
                  <input
                    id="fin-saida-valor"
                    className={`form-control${formErrors.valor ? ' is-invalid' : ''}`}
                    value={formS.valor}
                    onChange={(e) => {
                      setFormS({ ...formS, valor: maskMoneyBr(e.target.value) });
                      setFormErrors((p) => ({ ...p, valor: '' }));
                    }}
                    placeholder="0,00"
                    inputMode="numeric"
                    disabled={salvando}
                  />
                  {formErrors.valor ? <div className="invalid-feedback">{formErrors.valor}</div> : null}
                </div>
                <div className="col-md-4">
                  <label className="form-label" htmlFor="fin-saida-data">
                    Data <span className="text-danger">*</span>
                  </label>
                  <DateInputBr
                    id="fin-saida-data"
                    value={formS.data}
                    onChange={(e) => {
                      setFormS({ ...formS, data: e.target.value });
                      setFormErrors((p) => ({ ...p, data: '' }));
                    }}
                    className={`form-control${formErrors.data ? ' is-invalid' : ''}`}
                    disabled={salvando}
                  />
                  {formErrors.data ? (
                    <div className="invalid-feedback d-block">{formErrors.data}</div>
                  ) : null}
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="fin-fornecedor">
                    Fornecedor <span className="text-danger">*</span>
                  </label>
                  <input
                    id="fin-fornecedor"
                    className={`form-control${formErrors.fornecedor ? ' is-invalid' : ''}`}
                    value={formS.fornecedor}
                    onChange={(e) => {
                      setFormS({ ...formS, fornecedor: e.target.value });
                      setFormErrors((p) => ({ ...p, fornecedor: '' }));
                    }}
                    placeholder="Quem recebeu o pagamento"
                    disabled={salvando}
                  />
                  {formErrors.fornecedor ? (
                    <div className="invalid-feedback">{formErrors.fornecedor}</div>
                  ) : null}
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="fin-animal">
                    Animal (opcional)
                  </label>
                  <input
                    id="fin-animal"
                    className="form-control"
                    value={formS.animal}
                    onChange={(e) => setFormS({ ...formS, animal: e.target.value })}
                    placeholder="Nome do animal, se aplicável"
                    disabled={salvando}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="fin-saida-comp">
                    Comprovante (opcional)
                  </label>
                  <input
                    id="fin-saida-comp"
                    className="form-control"
                    value={formS.comprovante}
                    onChange={(e) => setFormS({ ...formS, comprovante: e.target.value })}
                    placeholder="Nº da nota, recibo ou link"
                    maxLength={255}
                    disabled={salvando}
                  />
                </div>
                <div className="col-12">
                  <div className="d-flex justify-content-between">
                    <label className="form-label" htmlFor="fin-saida-obs">
                      Observações
                    </label>
                    <span className="small text-muted">
                      {(formS.observacoes || '').length}/{OBS_MAX}
                    </span>
                  </div>
                  <textarea
                    id="fin-saida-obs"
                    className={`form-control${formErrors.observacoes ? ' is-invalid' : ''}`}
                    rows={3}
                    value={formS.observacoes}
                    maxLength={OBS_MAX}
                    onChange={(e) => setFormS({ ...formS, observacoes: e.target.value })}
                    placeholder="Detalhes úteis para conferência e auditoria"
                    disabled={salvando}
                  />
                  {formErrors.observacoes ? (
                    <div className="invalid-feedback">{formErrors.observacoes}</div>
                  ) : null}
                </div>
              </div>
              <div className="d-flex gap-2 mt-3">
                <button type="submit" className="btn btn-danger" disabled={salvando}>
                  {salvando ? 'Salvando…' : 'Salvar saída'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={fecharFormulario}
                  disabled={salvando}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!formulario && (
        <>
          <ApacTabs
            active={filtro}
            onChange={setFiltro}
            tabs={[
              { id: 'todos', label: 'Histórico' },
              { id: 'entrada', label: 'Entradas' },
              { id: 'saida', label: 'Saídas' },
            ]}
          />

          <div className="d-flex flex-wrap gap-2 mb-3 align-items-end">
            <div style={{ minWidth: 200, flex: '1 1 200px' }}>
              <label className="form-label small mb-1" htmlFor="fin-busca">
                Buscar
              </label>
              <input
                id="fin-busca"
                type="search"
                className="form-control"
                placeholder="Origem, responsável, campanha…"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <div style={{ width: 160 }}>
              <label className="form-label small mb-1" htmlFor="fin-de">
                De
              </label>
              <DateInputBr id="fin-de" value={dataDe} onChange={(e) => setDataDe(e.target.value)} />
            </div>
            <div style={{ width: 160 }}>
              <label className="form-label small mb-1" htmlFor="fin-ate">
                Até
              </label>
              <DateInputBr id="fin-ate" value={dataAte} onChange={(e) => setDataAte(e.target.value)} />
            </div>
            {filtrosAtivos ? (
              <button type="button" className="btn btn-link btn-sm mb-1" onClick={limparFiltros}>
                Limpar filtros
              </button>
            ) : null}
          </div>

          <div className="list-group">
            {historico.length === 0 ? (
              <p className="text-muted mb-0">
                {filtrosAtivos
                  ? 'Nenhum lançamento com os filtros atuais.'
                  : 'Nenhum lançamento.'}
              </p>
            ) : (
              historico.map((l) => (
                <div key={`${l.kind}-${l.id}`} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    <div className="flex-grow-1">
                      <strong>
                        {l.kind === 'entrada'
                          ? l.origem
                          : `${l.tipo} — ${l.fornecedor || '—'}`}
                      </strong>
                      <div className="small text-muted mt-1">
                        {l.data}
                        {l.kind === 'entrada' && l.responsavel ? ` · ${l.responsavel}` : ''}
                        {l.kind === 'entrada' && l.campanha ? ` · Campanha: ${l.campanha}` : ''}
                        {l.kind === 'saida' && l.animal ? ` · ${l.animal}` : ''}
                      </div>
                      {l.observacoes ? (
                        <div className="small mt-1">{l.observacoes}</div>
                      ) : null}
                      {l.comprovante ? (
                        <div className="small text-muted">Comprovante: {l.comprovante}</div>
                      ) : null}
                      <div className="small text-muted mt-1">
                        Lançado por {l.criadoPor || '—'}
                        {l.criadoEmBr ? ` em ${l.criadoEmBr}` : ''}
                      </div>
                    </div>
                    <div className="text-end flex-shrink-0">
                      <div
                        className={`fw-bold ${
                          l.kind === 'entrada' ? 'text-success' : 'text-danger'
                        }`}
                      >
                        {l.kind === 'entrada' ? '+' : '−'} {formatBRL(l.valor)}
                      </div>
                      <button
                        type="button"
                        className="btn btn-link btn-sm text-danger p-0 mt-1"
                        onClick={() => {
                          setMotivoAnulacao('');
                          setAnulando(l);
                        }}
                      >
                        Anular
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      <ConfirmModal
        show={Boolean(anulando)}
        title="Anular lançamento"
        confirmLabel="Anular"
        confirmVariant="danger"
        confirmDisabled={!motivoAnulacao.trim()}
        onConfirm={confirmarAnulacao}
        onCancel={() => {
          setAnulando(null);
          setMotivoAnulacao('');
        }}
        message={
          <>
            <p className="mb-2">
              O lançamento permanece no histórico para auditoria, fora do saldo.
            </p>
            <label className="form-label" htmlFor="motivo-anulacao-fin">
              Motivo <span className="text-danger">*</span>
            </label>
            <textarea
              id="motivo-anulacao-fin"
              className="form-control"
              rows={3}
              maxLength={500}
              value={motivoAnulacao}
              onChange={(e) => setMotivoAnulacao(e.target.value)}
              placeholder="Ex.: lançamento duplicado, valor incorreto…"
            />
            <div className="form-text">{motivoAnulacao.length}/500 caracteres</div>
          </>
        }
      />
    </PageShell>
  );
}
