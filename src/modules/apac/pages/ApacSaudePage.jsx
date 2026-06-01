import { useState, useEffect, useCallback } from 'react';
import { ApiError } from '../../../api/client';
import * as saudeApi from '../../../api/saudeApi';
import { getDataAtualIso } from '../../../utils/dates';
import PageShell from '../../../components/PageShell';
import ApacTabs from '../components/ApacTabs';
import FeedbackAlert from '../../../components/FeedbackAlert';
import { useTimedMessage } from '../../../hooks/useTimedMessage';
import { listarAnimais } from '../../animais/utils/storageAnimais';

const TIPOS = [
  { value: 'consulta', label: 'Consulta', badge: 'bg-info' },
  { value: 'vacina', label: 'Vacina', badge: 'bg-success' },
  { value: 'exame', label: 'Exame', badge: 'bg-warning text-dark' },
  { value: 'cirurgia', label: 'Cirurgia', badge: 'bg-danger' },
];

const emptyReg = {
  tipo: 'consulta',
  titulo: '',
  descricao: '',
  data: getDataAtualIso(),
  vet: '',
};

export default function ApacSaudePage() {
  const [data, setData] = useState({ registros: [], vacinas: [] });
  const [animalId, setAnimalId] = useState(null);
  const [tab, setTab] = useState('atendimentos');
  const [form, setForm] = useState(emptyReg);
  const [msg, setMsg] = useTimedMessage(3000);
  const [erro, setErro] = useTimedMessage(6000);
  const [animais, setAnimais] = useState([]);

  useEffect(() => {
    listarAnimais()
      .then((lista) => {
        setAnimais(lista);
        if (lista.length > 0) {
          setAnimalId((atual) => atual ?? lista[0].id);
        }
      })
      .catch(() => setAnimais([]));
  }, []);

  const carregarSaude = useCallback(async () => {
    if (!animalId) return;
    try {
      const raw = await saudeApi.loadSaude(animalId);
      setData(saudeApi.mapSaudeUi(raw));
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar saúde animal. Execute database/apac_extended_schema.sql.'
      );
    }
  }, [animalId, setErro]);

  useEffect(() => {
    carregarSaude();
  }, [carregarSaude]);

  const animalSelecionado = animais.find((a) => a.id === animalId);

  async function salvarRegistro(e) {
    e.preventDefault();
    if (!animalId) return;
    try {
      await saudeApi.createRegistro(animalId, form);
      setForm({ ...emptyReg, data: getDataAtualIso() });
      setMsg('Registro salvo.');
      await carregarSaude();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao salvar registro.');
    }
  }

  const registrosAnimal = data.registros;
  const vacinasAnimal = data.vacinas;

  return (
    <PageShell title="Saúde animal" subtitle="Histórico veterinário por animal">
      <FeedbackAlert message={msg} />
      <FeedbackAlert message={erro} variant="danger" />

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body d-flex flex-wrap align-items-center gap-3">
          <div className="fs-2">🐾</div>
          <div className="flex-grow-1">
            <label className="form-label small text-muted mb-1">Animal selecionado</label>
            {animais.length === 0 ? (
              <p className="text-muted small mb-0">
                Nenhum animal cadastrado. Use Cadastros → Animais.
              </p>
            ) : (
              <select
                className="form-select"
                style={{ maxWidth: 280 }}
                value={animalId ?? ''}
                onChange={(e) => setAnimalId(Number(e.target.value))}
              >
                {animais.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome}
                  </option>
                ))}
              </select>
            )}
          </div>
          {animalSelecionado && (
            <span className="badge bg-light text-dark border">{animalSelecionado.especie}</span>
          )}
        </div>
      </div>

      <ApacTabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'atendimentos', label: 'Atendimentos' },
          { id: 'vacinas', label: 'Vacinas' },
          { id: 'novo', label: '+ Registrar' },
        ]}
      />

      {tab === 'novo' && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <form onSubmit={salvarRegistro}>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Tipo</label>
                  <select
                    className="form-select"
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  >
                    {TIPOS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
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
                    value={form.data}
                    onChange={(e) => setForm({ ...form, data: e.target.value })}
                    required
                  />
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
                <div className="col-md-6">
                  <label className="form-label">Veterinário</label>
                  <input
                    className="form-control"
                    value={form.vet}
                    onChange={(e) => setForm({ ...form, vet: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-success mt-3" disabled={!animalId}>
                Salvar registro
              </button>
            </form>
          </div>
        </div>
      )}

      {tab === 'atendimentos' && (
        <div className="list-group">
          {registrosAnimal.length === 0 ? (
            <p className="text-muted">
              Nenhum atendimento para {animalSelecionado?.nome ?? 'este animal'}.
            </p>
          ) : (
            registrosAnimal.map((r) => {
              const tipo = TIPOS.find((t) => t.value === r.tipo) || TIPOS[0];
              return (
                <div key={r.id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <span className={`badge ${tipo.badge}`}>{tipo.label}</span>
                    <span className="text-muted small">{r.data}</span>
                  </div>
                  <h6 className="mb-1">{r.titulo}</h6>
                  <p className="mb-1 small">{r.descricao}</p>
                  {r.vet && <p className="mb-0 small text-muted">{r.vet}</p>}
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === 'vacinas' && (
        <div className="row g-3">
          {vacinasAnimal.length === 0 ? (
            <div className="col-12 text-muted">Nenhuma vacina cadastrada.</div>
          ) : (
            vacinasAnimal.map((v) => (
              <div className="col-md-6" key={v.id}>
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="fw-semibold">{v.nome}</h6>
                    <p className="small mb-1">Aplicada: {v.aplicada}</p>
                    <p className="small mb-2">Próxima: {v.proxima || '—'}</p>
                    <span
                      className={`badge ${v.status === 'em_dia' ? 'bg-success' : 'bg-warning text-dark'}`}
                    >
                      {v.status === 'em_dia' ? 'Em dia' : v.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </PageShell>
  );
}
