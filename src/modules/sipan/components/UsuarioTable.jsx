import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../../components/ConfirmModal';
import ActionIconButtons from '../../../components/ActionIconButtons';
import StatusToggle from '../../../components/StatusToggle';
import { useAuth } from '../../../context/AuthContext';

const PERMISSOES = ['Administrador', 'Financeiro', 'Veterinário', 'Voluntário'];

const COLS = [
  { key: 'nome', label: 'Nome' },
  { key: 'login', label: 'Login' },
  { key: 'email', label: 'E-mail' },
  { key: 'permissao', label: 'Permissão' },
  { key: 'status', label: 'Status' },
];

export default function UsuarioTable({ usuarios, onDelete, onStatusChange, salvandoStatusId }) {
  const navigate = useNavigate();
  const { usuario: usuarioLogado } = useAuth();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos');
  const [confirmId, setConfirmId] = useState(null);
  const [sortCol, setSortCol] = useState('nome');
  const [sortDir, setSortDir] = useState(1);

  function handleSort(col) {
    if (sortCol === col) setSortDir((d) => d * -1);
    else { setSortCol(col); setSortDir(1); }
  }

  function sortIcon(col) {
    if (sortCol !== col) return ' ↕';
    return sortDir === 1 ? ' ↑' : ' ↓';
  }

  const filtered = usuarios
    .filter((u) => {
      let matchFilter = true;
      if (filter === 'Ativo' || filter === 'Inativo') matchFilter = u.status === filter;
      else if (PERMISSOES.includes(filter)) matchFilter = u.permissao === filter;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        u.nome.toLowerCase().includes(q) ||
        u.login.toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q);
      return matchFilter && matchSearch;
    })
    .sort((a, b) => {
      const va = (a[sortCol] ?? '').toLowerCase();
      const vb = (b[sortCol] ?? '').toLowerCase();
      return va.localeCompare(vb, 'pt-BR', { sensitivity: 'base' }) * sortDir;
    });

  const confirmTarget = confirmId ? usuarios.find((u) => u.id === confirmId) : null;

  return (
    <>
      <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
        <input
          type="search"
          className="form-control"
          style={{ maxWidth: 300 }}
          placeholder="Buscar por nome, login ou e-mail…"
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
          {PERMISSOES.map((p) => (
            <button
              key={p}
              type="button"
              className={`btn btn-sm ${filter === p ? 'btn-success' : 'btn-outline-secondary'}`}
              onClick={() => setFilter(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <span className="ms-auto text-muted small">
          {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <p className="mb-1 fw-semibold">Nenhum usuário encontrado.</p>
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
              {filtered.map((u) => {
                const souEu = Number(usuarioLogado?.id) === Number(u.id);
                return (
                <tr key={u.id}>
                  <td className="fw-medium">{u.nome}</td>
                  <td className="text-muted">{u.login}</td>
                  <td className="text-muted">{u.email || '—'}</td>
                  <td className="text-muted">{u.permissao}</td>
                  <td>
                    <StatusToggle
                      id={`usuario-status-${u.id}`}
                      ativo={u.status === 'Ativo'}
                      disabled={souEu || salvandoStatusId === u.id}
                      onChange={(status) => onStatusChange?.(u, status)}
                    />
                  </td>
                  <td>
                    <ActionIconButtons
                      onEdit={() => navigate(`/usuarios/${u.id}/editar`)}
                      onDelete={souEu ? undefined : () => setConfirmId(u.id)}
                    />
                  </td>
                </tr>
              );
              })}
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