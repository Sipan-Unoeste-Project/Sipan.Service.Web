import { useState, useEffect } from 'react';
import PageShell from '../../../components/PageShell';
import ApacTabs from '../components/ApacTabs';
import { loadSaude, saveSaude, getDataAtual } from '../storage/apacStorage';
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
  data: getDataAtual(),
  vet: '',
};

export default function ApacSaudePage() {
  const [data, setData] = useState({ registros: [], vacinas: [] });
  const [animalNome, setAnimalNome] = useState('');
  const [tab, setTab] = useState('atendimentos');
  const [form, setForm] = useState(emptyReg);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const saude = loadSaude();
    setData(saude);
    const animais = listarAnimais();
    if (animais.length > 0) {
      setAnimalNome(saude.registros[0]?.animalNome || animais[0].nome);
    } else if (saude.registros[0]) {
      setAnimalNome(saude.registros[0].animalNome);
    }
  }, []);

  useEffect(() => {
    if (msg) {
      const t = setTimeout(() => setMsg(''), 3000);
      return () => clearTimeout(t);
    }
  }, [msg]);

  const animais = listarAnimais();
  const nomes = animais.map((a) => a.nome);

  function persist(next) {
    setData(next);
    saveSaude(next);
  }

  function salvarRegistro(e) {
    e.preventDefault();
    persist({
      ...data,
      registros: [
        {
          id: Date.now(),
          animalNome,
          ...form,
        },
        ...data.registros,
      ],
    });
    setForm({ ...emptyReg, data: getDataAtual() });
    setMsg('Registro salvo.');
  }

  const registrosAnimal = data.registros.filter((r) => r.animalNome === animalNome);
  const vacinasAnimal = data.vacinas.filter((v) => v.animalNome === animalNome);

  return (
    <PageShell title="Saúde animal" subtitle="Histórico veterinário por animal">
      {msg && <div className="alert alert-success py-2">{msg}</div>}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body d-flex flex-wrap align-items-center gap-3">
          <div className="fs-2">🐾</div>
          <div className="flex-grow-1">
            <label className="form-label small text-muted mb-1">Animal selecionado</label>
            {nomes.length === 0 ? (
              <p className="text-muted small mb-0">
                Nenhum animal cadastrado. Use Cadastros → Animais.
              </p>
            ) : (
              <select
                className="form-select"
                style={{ maxWidth: 280 }}
                value={animalNome}
                onChange={(e) => setAnimalNome(e.target.value)}
              >
                {nomes.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            )}
          </div>
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
              <button type="submit" className="btn btn-success mt-3">
                Salvar registro
              </button>
            </form>
          </div>
        </div>
      )}

      {tab === 'atendimentos' && (
        <div className="list-group">
          {registrosAnimal.length === 0 ? (
            <p className="text-muted">Nenhum atendimento para {animalNome}.</p>
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
                    <p className="small mb-2">Próxima: {v.proxima}</p>
                    <span
                      className={`badge ${v.status === 'em_dia' ? 'bg-success' : 'bg-warning text-dark'}`}
                    >
                      {v.status === 'em_dia' ? 'Em dia' : 'A vencer'}
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
