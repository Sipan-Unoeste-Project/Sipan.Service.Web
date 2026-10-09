import { useState, useEffect, useCallback, useMemo } from 'react';
import { ApiError } from '../../../api/client';
import * as saudeApi from '../../../api/saudeApi';
import { formatDateTimeBr, getDataAtualIso } from '../../../utils/dates';
import FormSelect from '../../../components/FormSelect';
import PageShell from '../../../components/PageShell';
import ApacTabs from '../components/ApacTabs';
import ConfirmModal from '../../../components/ConfirmModal';
import FeedbackAlert from '../../../components/FeedbackAlert';
import { useTimedMessage } from '../../../hooks/useTimedMessage';
import { usePermissao } from '../../../hooks/usePermissao';
import { listarAnimais } from '../../animais/utils/storageAnimais';

const TIPOS = [
  { value: 'consulta', label: 'Consulta', badge: 'bg-success-subtle text-success' },
  { value: 'vacina', label: 'Vacina', badge: 'bg-success' },
  { value: 'exame', label: 'Exame', badge: 'bg-warning text-dark' },
  { value: 'cirurgia', label: 'Cirurgia', badge: 'bg-danger' },
];

const emptyReg = {
  tipo: 'consulta',
  titulo: '',
  descricao: '',
  data: getDataAtualIso(),
  proxima: '',
  vet: '',
};

const FILTROS_HISTORICO = [
  { id: 'todos', label: 'Tudo' },
  { id: 'consulta', label: 'Consultas' },
  { id: 'exame', label: 'Exames' },
  { id: 'cirurgia', label: 'Cirurgias' },
  { id: 'vacina', label: 'Vacinas' },
];

function getStatusVacina(dataProxima) {
  if (!dataProxima) return { label: 'Em dia', badge: 'bg-success' };

  const hoje = new Date();
  const hojeIso = [
    hoje.getFullYear(),
    String(hoje.getMonth() + 1).padStart(2, '0'),
    String(hoje.getDate()).padStart(2, '0'),
  ].join('-');
  const diasAteVencimento =
    (Date.parse(`${dataProxima}T00:00:00`) - Date.parse(`${hojeIso}T00:00:00`)) /
    (1000 * 60 * 60 * 24);

  if (diasAteVencimento < 0) return { label: 'Atrasada', badge: 'bg-danger' };
  if (diasAteVencimento <= 30) {
    return { label: 'Vence em breve', badge: 'bg-warning text-dark' };
  }
  return { label: 'Em dia', badge: 'bg-success' };
}

function normalizarTextoBusca(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}

export default function ApacSaudePage() {
  const [data, setData] = useState({ registros: [], vacinas: [] });
  const [animalId, setAnimalId] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [buscaAnimal, setBuscaAnimal] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(emptyReg);
  const [msg, setMsg] = useTimedMessage(3000);
  const [erro, setErro] = useTimedMessage(6000);
  const [animais, setAnimais] = useState([]);
  const [anulando, setAnulando] = useState(null);
  const [motivoAnulacao, setMotivoAnulacao] = useState('');
  const [mostrarAnulados, setMostrarAnulados] = useState(false);
  const { podeRecurso } = usePermissao();
  const podeAnular = podeRecurso('saude');

  useEffect(() => {
    listarAnimais()
      .then((lista) => {
        setAnimais(lista);
        if (lista.length > 0) setAnimalId((atual) => atual ?? lista[0].id);
      })
      .catch((err) => {
        setAnimais([]);
        setErro(
          err instanceof ApiError
            ? err.message
            : 'Não foi possível carregar a lista de animais.'
        );
      });
  }, [setErro]);

  const carregarSaude = useCallback(async () => {
    try {
      const raw = await saudeApi.loadSaude(undefined, {
        incluirAnulados: mostrarAnulados,
      });
      setData(saudeApi.mapSaudeUi(raw));
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar saúde animal. Execute npm run migrate na API.'
      );
    }
  }, [mostrarAnulados, setErro]);

  useEffect(() => {
    carregarSaude();
  }, [carregarSaude]);

  const animalSelecionado = animais.find((a) => Number(a.id) === Number(animalId));

  function abrirForm(registro) {
    if (registro) {
      setEditando({ id: registro.id, tipo: registro.origem });
      setForm({
        tipo: registro.origem === 'vacina' ? 'vacina' : registro.tipo,
        titulo: registro.origem === 'vacina' ? registro.nome : registro.titulo,
        descricao: registro.descricao || '',
        data: registro.origem === 'vacina' ? registro.aplicadaIso : registro.dataIso,
        proxima: registro.origem === 'vacina' ? registro.proximaIso || '' : '',
        vet: registro.vet || '',
      });
    } else {
      setEditando(null);
      setForm({ ...emptyReg, data: getDataAtualIso() });
    }
    setMostrarForm(true);
  }

  function fecharForm() {
    setMostrarForm(false);
    setEditando(null);
    setForm({ ...emptyReg, data: getDataAtualIso() });
  }

  async function salvarRegistro(event) {
    event.preventDefault();
    if (!animalId) return;
    if (form.tipo !== 'vacina' && form.data > getDataAtualIso()) {
      setErro('A data do atendimento não pode ser futura.');
      return;
    }
    if (form.tipo === 'vacina' && form.proxima && form.proxima < form.data) {
      setErro('A data da próxima vacina não pode ser anterior à data da vacina.');
      return;
    }
    try {
      if (editando) {
        await saudeApi.updateRegistro(editando.id, animalId, form, editando.tipo);
      }
      else await saudeApi.createRegistro(animalId, form);

      const mensagem = editando ? 'Registro atualizado.' : 'Registro salvo.';
      fecharForm();
      setFiltroTipo('todos');
      setMsg(mensagem);
      await carregarSaude();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao salvar registro.');
    }
  }

  async function confirmarAnulacao() {
    if (!anulando) return;
    const motivo = motivoAnulacao.trim();
    if (!motivo) {
      setErro('Informe o motivo da anulação.');
      return;
    }
    try {
      await saudeApi.anularRegistro(anulando.id, anulando.tipo, motivo);
      setAnulando(null);
      setMotivoAnulacao('');
      setMsg('Registro anulado e preservado no histórico.');
      await carregarSaude();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao anular registro.');
    }
  }

  const registrosAnimal = data.registros.filter(
    (registro) => Number(registro.animal_id) === Number(animalId)
  );
  const vacinasAnimal = data.vacinas.filter(
    (vacina) => Number(vacina.animal_id) === Number(animalId)
  );
  const buscaNormalizada = normalizarTextoBusca(buscaAnimal);
  const animaisFiltrados = animais.filter((animal) =>
    [animal.nome, animal.especie].some((valor) =>
      normalizarTextoBusca(valor).includes(buscaNormalizada)
    )
  );

  const vacinasAtrasadas = useMemo(
    () =>
      data.vacinas
        .filter(
          (vacina) =>
            !vacina.anuladaEm && getStatusVacina(vacina.proximaIso).label === 'Atrasada'
        )
        .sort((a, b) => a.proximaIso.localeCompare(b.proximaIso)),
    [data.vacinas]
  );

  const linhaDoTempo = useMemo(() => {
    const eventos = [
      ...registrosAnimal.map((registro) => ({
        ...registro,
        origem: 'registro',
        chave: `registro-${registro.id}`,
      })),
      ...vacinasAnimal.map((vacina) => ({
        ...vacina,
        origem: 'vacina',
        tipo: 'vacina',
        titulo: vacina.nome,
        data: vacina.aplicada,
        dataIso: vacina.aplicadaIso,
        chave: `vacina-${vacina.id}`,
      })),
    ];

    return eventos
      .filter((evento) => filtroTipo === 'todos' || evento.tipo === filtroTipo)
      .sort((a, b) => b.dataIso.localeCompare(a.dataIso) || b.id - a.id);
  }, [filtroTipo, registrosAnimal, vacinasAnimal]);

  return (
    <PageShell
      title="Saúde animal"
      subtitle="Histórico veterinário por animal"
      action={
        !mostrarForm ? (
          <button
            type="button"
            className="btn btn-success"
            disabled={!animalId}
            onClick={() => abrirForm()}
          >
            Novo Registro
          </button>
        ) : null
      }
    >
      <FeedbackAlert message={msg} />
      <FeedbackAlert message={erro} variant="danger" />

      {!mostrarForm && (
        <section className="card border-0 shadow-sm mb-4" aria-labelledby="vacinas-atrasadas-titulo">
          <div className="card-body">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <h5 id="vacinas-atrasadas-titulo" className="fw-semibold mb-0">
                Vacinas atrasadas
              </h5>
              <span className="badge bg-danger">{vacinasAtrasadas.length}</span>
            </div>
            {vacinasAtrasadas.length === 0 ? (
              <p className="text-muted mb-0">Nenhuma vacina atrasada.</p>
            ) : (
              <div className="list-group">
                {vacinasAtrasadas.map((vacina) => (
                  <div
                    key={`pendencia-${vacina.id}`}
                    className="list-group-item d-flex flex-wrap justify-content-between align-items-center gap-2"
                  >
                    <div>
                      <strong>{vacina.animalNome || `Animal #${vacina.animal_id}`}</strong>
                      <span className="text-muted"> — {vacina.nome}</span>
                      <div className="small text-danger">
                        Vencida em {vacina.proxima || 'data não informada'}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-success"
                      onClick={() => {
                        setAnimalId(Number(vacina.animal_id));
                        setFiltroTipo('todos');
                      }}
                    >
                      Abrir histórico
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body d-flex flex-wrap align-items-center gap-3">
          <div className="fs-2">🐾</div>
          <div className="flex-grow-1">
            <label className="form-label small text-muted mb-1">
              Animal selecionado
            </label>
            {animais.length === 0 ? (
              <p className="text-muted small mb-0">
                Nenhum animal cadastrado. Use Cadastros → Animais.
              </p>
            ) : (
              <>
                <input
                  id="busca-animal-saude"
                  type="search"
                  className="form-control"
                  autoComplete="off"
                  placeholder="Buscar animal por nome ou espécie"
                  value={buscaAnimal}
                  onChange={(event) => setBuscaAnimal(event.target.value)}
                  aria-label="Buscar animal por nome ou espécie"
                />
                {buscaNormalizada && (
                  <div
                    className="list-group mt-2"
                    role="listbox"
                    aria-label="Resultados da busca de animais"
                    style={{ maxHeight: 240, overflowY: 'auto' }}
                  >
                    {animaisFiltrados.length === 0 ? (
                      <div className="list-group-item text-muted small">
                        Nenhum animal corresponde à busca.
                      </div>
                    ) : (
                      animaisFiltrados.map((animal) => (
                        <button
                          key={animal.id}
                          type="button"
                          role="option"
                          aria-selected={Number(animal.id) === Number(animalId)}
                          className={`list-group-item list-group-item-action ${
                            Number(animal.id) === Number(animalId) ? 'active' : ''
                          }`}
                          onClick={() => {
                            setAnimalId(Number(animal.id));
                            setBuscaAnimal('');
                          }}
                        >
                          {animal.nome}
                          {animal.especie && (
                            <span
                              className={
                                Number(animal.id) === Number(animalId)
                                  ? 'small ms-2 text-white'
                                  : 'small ms-2 text-muted'
                              }
                            >
                              {animal.especie}
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
                {animalSelecionado && (
                  <p className="small text-muted mt-2 mb-0">
                    Selecionado: <strong>{animalSelecionado.nome}</strong>
                    {animalSelecionado.especie ? ` — ${animalSelecionado.especie}` : ''}
                  </p>
                )}
              </>
            )}
          </div>
          {animalSelecionado && (
            <span className="badge bg-light text-dark border">{animalSelecionado.especie}</span>
          )}
        </div>
      </div>

      {mostrarForm ? (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="fw-semibold mb-3">{editando ? 'Editar registro' : 'Novo registro'}</h5>
            <form onSubmit={salvarRegistro}>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Tipo</label>
                  <FormSelect
                    value={form.tipo}
                    disabled={!!editando}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  >
                    {TIPOS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </FormSelect>
                </div>
                <div className="col-md-5">
                  <label className="form-label">Título</label>
                  <input
                    className="form-control"
                    value={form.titulo}
                    onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Data</label>
                  <input
                    type="date"
                    className="form-control"
                    max={form.tipo === 'vacina' ? undefined : getDataAtualIso()}
                    value={form.data}
                    onChange={(e) => setForm({ ...form, data: e.target.value })}
                    required
                  />
                </div>
                {form.tipo === 'vacina' && (
                  <div className="col-md-4">
                    <label className="form-label">Próxima</label>
                    <input
                      type="date"
                      className="form-control"
                      min={form.data}
                      value={form.proxima}
                      onChange={(e) => setForm({ ...form, proxima: e.target.value })}
                    />
                  </div>
                )}
                <div className="col-12">
                  <label className="form-label">Descrição</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={form.descricao}
                    onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Veterinário</label>
                  <input
                    className="form-control"
                    value={form.vet}
                    onChange={(e) => setForm({ ...form, vet: e.target.value })}
                  />
                </div>
              </div>
              <div className="d-flex gap-2 mt-3">
                <button type="submit" className="btn btn-success" disabled={!animalId}>
                  Salvar registro
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
          <ApacTabs active={filtroTipo} onChange={setFiltroTipo} tabs={FILTROS_HISTORICO} />
          <div className="form-check form-switch mb-3">
            <input
              id="mostrar-registros-anulados"
              className="form-check-input"
              type="checkbox"
              checked={mostrarAnulados}
              onChange={(event) => setMostrarAnulados(event.target.checked)}
            />
            <label className="form-check-label" htmlFor="mostrar-registros-anulados">
              Mostrar registros anulados
            </label>
          </div>
          {!animalId ? (
            <p className="text-muted">Selecione um animal para consultar o histórico.</p>
          ) : linhaDoTempo.length === 0 ? (
            <p className="text-muted">
              Nenhum registro encontrado para {animalSelecionado?.nome ?? 'este animal'}.
            </p>
          ) : (
            <div className="list-group">
              {linhaDoTempo.map((evento) => {
                const tipo = TIPOS.find((item) => item.value === evento.tipo) || TIPOS[0];
                const statusVacina =
                  evento.origem === 'vacina' ? getStatusVacina(evento.proximaIso) : null;

                return (
                  <article key={evento.chave} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <span className={`badge ${tipo.badge}`}>{tipo.label}</span>
                      <span className="text-muted small">{evento.data}</span>
                    </div>
                    <h6 className="mb-1">{evento.titulo}</h6>
                    {evento.origem === 'vacina' && (
                      <>
                        <p className="small mb-1">Aplicada: {evento.aplicada}</p>
                        <p className="small mb-2">Próxima: {evento.proxima || '—'}</p>
                        <span className={`badge ${statusVacina.badge}`}>
                          {statusVacina.label}
                        </span>
                      </>
                    )}
                    {evento.descricao && (
                      <p className="mb-1 small mt-2">{evento.descricao}</p>
                    )}
                    {evento.vet && (
                      <p className="mb-1 small text-muted">Veterinário: {evento.vet}</p>
                    )}
                    {evento.criadoPorNome && (
                      <p className="mb-0 small text-muted">
                        Cadastrado por: {evento.criadoPorNome}
                      </p>
                    )}
                    {evento.alteradoPorNome && (
                      <p className="mb-0 small text-muted">
                        Alterado por: {evento.alteradoPorNome}
                        {evento.atualizadoEm
                          ? ` em ${formatDateTimeBr(evento.atualizadoEm)}`
                          : ''}
                      </p>
                    )}
                    {evento.anuladaEm ? (
                      <div className="alert alert-secondary mt-3 mb-0">
                        <strong>Registro anulado</strong>
                        {evento.anuladaPorNome && <span> por {evento.anuladaPorNome}</span>}
                        {evento.anuladaEm && (
                          <span> em {formatDateTimeBr(evento.anuladaEm)}</span>
                        )}
                        {evento.motivoAnulacao && (
                          <p className="mb-0 mt-1">Motivo: {evento.motivoAnulacao}</p>
                        )}
                      </div>
                    ) : (
                      <div className="d-flex gap-2 mt-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-success"
                          onClick={() => abrirForm(evento)}
                        >
                          Editar
                        </button>
                        {podeAnular && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => {
                              setAnulando({
                                id: evento.id,
                                tipo: evento.origem,
                                nome: evento.titulo,
                              });
                              setMotivoAnulacao('');
                            }}
                          >
                            Anular
                          </button>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      <ConfirmModal
        show={!!anulando}
        title="Anular registro de saúde"
        confirmLabel="Anular registro"
        confirmVariant="danger"
        confirmDisabled={!motivoAnulacao.trim()}
        message={
          <>
            <p>
              O registro <strong>{anulando?.nome}</strong> será ocultado do histórico normal,
              mas permanecerá armazenado para auditoria.
            </p>
            <label className="form-label" htmlFor="motivo-anulacao-saude">
              Motivo da anulação
            </label>
            <textarea
              id="motivo-anulacao-saude"
              className="form-control"
              rows={3}
              maxLength={500}
              required
              value={motivoAnulacao}
              onChange={(event) => setMotivoAnulacao(event.target.value)}
            />
            <div className="form-text">{motivoAnulacao.length}/500 caracteres</div>
          </>
        }
        onConfirm={confirmarAnulacao}
        onCancel={() => {
          setAnulando(null);
          setMotivoAnulacao('');
        }}
      />
    </PageShell>
  );
}
