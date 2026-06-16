import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../../components/ConfirmModal';
import StatusToggle from '../../../components/StatusToggle';

const AREAS = ['Administrador', 'Financeiro', 'Voluntário', 'Veterinário', 'Recepcionista', 'Auxiliar'];

const COLS = [
  { key: 'nome', label: 'Nome' },
  { key: 'cpf', label: 'CPF' },
  { key: 'cargo', label: 'Área de atuação' },
  { key: 'telefone', label: 'Telefone' },
  { key: 'status', label: 'Status' },
];

export default function VoluntarioTable({ voluntarios, onDelete, onStatusChange, salvandoStatusId }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos');
  const [confirmId, setConfirmId] = useState(null);
  const [sortCol, setSortCol] = useState('nome');
  const [sortDir, setSortDir] = useState(1); // 1 = A→Z, -1 = Z→A

  function handleSort(col) {
    if (sortCol === col) setSortDir((d) => d * -1);
    else { setSortCol(col); setSortDir(1); }
  }

  function sortIcon(col) {
    if (sortCol !== col) return ' ↕';
    return sortDir === 1 ? ' ↑' : ' ↓';
  }

  const filtered = voluntarios
    .filter((f) => {
      let matchFilter = true;
      if (filter === 'Ativo' || filter === 'Inativo') matchFilter = f.status === filter;
      else if (AREAS.includes(filter)) matchFilter = f.cargo === filter;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        f.nome.toLowerCase().includes(q) ||
        f.cpf.includes(q) ||
        f.telefone.includes(q) ||
        (f.cargo || '').toLowerCase().includes(q);
      return matchFilter && matchSearch;
    })
    .sort((a, b) => {
      const va = (a[sortCol] ?? '').toLowerCase();
      const vb = (b[sortCol] ?? '').toLowerCase();
      return va.localeCompare(vb, 'pt-BR', { sensitivity: 'base' }) * sortDir;
    });

  const confirmTarget = confirmId ? voluntarios.find((v) => v.id === confirmId) : null;

  return (
    <>
      <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
        <input
          type="search"
          className="form-control"
          style={{ maxWidth: 300 }}
          placeholder="Buscar por nome, CPF ou telefone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="btn-group flex-wrap" role="group" aria-label="Filtros">
          {['todos', 'Ativo', 'Inativo'].map((s) => (
            <button
              key={s}
              type="button"
              className={`btn btn-sm ${filter === s ? 'btn-success' : 'btn-outline-secondary'}`}
              onClick={() => setFilter(s)}
            >
              {s === 'todos' ? 'Todos' : s}
            </button>
          ))}
          {AREAS.map((a) => (
            <button
              key={a}
              type="button"
              className={`btn btn-sm ${filter === a ? 'btn-success' : 'btn-outline-secondary'}`}
              onClick={() => setFilter(a)}
            >
              {a}
            </button>
          ))}
        </div>
        <span className="ms-auto text-muted small">
          {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <p className="mb-1 fw-semibold">Nenhum voluntário encontrado.</p>
          <small>Tente ajustar a busca ou o filtro.</small>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                {COLS.map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                  >
                    {label}
                    <span className="text-muted" style={{ fontSize: 12 }}>{sortIcon(key)}</span>
                  </th>
                ))}
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id}>
                  <td className="fw-medium">{f.nome}</td>
                  <td className="text-muted">{f.cpf}</td>
                  <td className="text-muted">{f.cargo}</td>
                  <td>{f.telefone}</td>
                  <td>
                    <StatusToggle
                      id={`voluntario-status-${f.id}`}
                      ativo={f.status === 'Ativo'}
                      disabled={salvandoStatusId === f.id}
                      onChange={(status) => onStatusChange?.(f, status)}
                    />
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-secondary me-1"
                      onClick={() => navigate(`/voluntarios/${f.id}/editar`)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => setConfirmId(f.id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        show={!!confirmId}
        nome={confirmTarget?.nome}
        onConfirm={() => { onDelete(confirmId); setConfirmId(null); }}
        onCancel={() => setConfirmId(null)}
      />
    </>
  );
}