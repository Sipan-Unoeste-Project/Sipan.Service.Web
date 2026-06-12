import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../../components/ConfirmModal';
import StatusToggle from '../../../components/StatusToggle';

const AREAS = ['Administrador', 'Financeiro', 'Voluntário', 'Veterinário', 'Recepcionista', 'Auxiliar'];

export default function VoluntarioTable({ funcionarios, onDelete, onStatusChange, salvandoStatusId }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos');
  const [confirmId, setConfirmId] = useState(null);

  const filtered = funcionarios
    .filter((f) => {
      let matchFilter = true;
      if (filter === 'Ativo' || filter === 'Inativo') {
        matchFilter = f.status === filter;
      } else if (AREAS.includes(filter)) {
        matchFilter = f.cargo === filter;
      }
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        f.nome.toLowerCase().includes(q) ||
        f.cpf.includes(q) ||
        f.telefone.includes(q) ||
        (f.cargo || '').toLowerCase().includes(q);
      return matchFilter && matchSearch;
    })
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));

  const confirmTarget = confirmId ? funcionarios.find((f) => f.id === confirmId) : null;

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
                <th>Nome</th>
                <th>CPF</th>
                <th>Área de atuação</th>
                <th>Telefone</th>
                <th>Status</th>
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
                      title="Editar"
                      onClick={() => navigate(`/funcionarios/${f.id}/editar`)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      title="Excluir"
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
        onConfirm={() => {
          onDelete(confirmId);
          setConfirmId(null);
        }}
        onCancel={() => setConfirmId(null)}
      />
    </>
  );
}
