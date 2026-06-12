import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormSelect from '../../../components/FormSelect';
import ConfirmModal from '../../../components/ConfirmModal';

const STATUS_FILTRO = ['todos', 'Pendente', 'Em análise', 'Aprovada', 'Recusada', 'Concluída'];

function formatAnimal(s) {
  if (s.animalNome) {
    return s.animalEspecie ? `${s.animalNome} (${s.animalEspecie})` : s.animalNome;
  }
  return '—';
}

function formatData(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
}

function badgeStatus(status) {
  const map = {
    Pendente: 'bg-warning text-dark',
    'Em análise': 'bg-success-subtle text-success',
    Aprovada: 'bg-success',
    Recusada: 'bg-danger',
    Concluída: 'bg-secondary',
  };
  return map[status] || 'bg-secondary';
}

export default function AdocaoTable({ solicitacoes, onDelete, onStatusChange, salvandoStatusId }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos');
  const [confirmId, setConfirmId] = useState(null);

  const filtered = solicitacoes
    .filter((s) => {
      const matchStatus = filter === 'todos' || s.status === filter;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        s.nomeAdotante.toLowerCase().includes(q) ||
        s.cpf.includes(q) ||
        (s.animalNome || '').toLowerCase().includes(q);
      return matchStatus && matchSearch;
    })
    .sort((a, b) => a.nomeAdotante.localeCompare(b.nomeAdotante, 'pt-BR', { sensitivity: 'base' }));

  const confirmTarget = confirmId ? solicitacoes.find((s) => s.id === confirmId) : null;

  return (
    <>
      <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
        <input
          type="search"
          className="form-control"
          style={{ maxWidth: 300 }}
          placeholder="Buscar por adotante, CPF ou animal…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="btn-group flex-wrap" role="group" aria-label="Filtros">
          {STATUS_FILTRO.map((st) => (
            <button
              key={st}
              type="button"
              className={`btn btn-sm ${filter === st ? 'btn-success' : 'btn-outline-secondary'}`}
              onClick={() => setFilter(st)}
            >
              {st === 'todos' ? 'Todos' : st}
            </button>
          ))}
        </div>

        <span className="ms-auto text-muted small">
          {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <p className="mb-1 fw-semibold">Nenhuma solicitação encontrada.</p>
          <small>Tente ajustar a busca ou o filtro.</small>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Adotante</th>
                <th>CPF</th>
                <th>Animal</th>
                <th>Data</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td className="fw-medium">{s.nomeAdotante}</td>
                  <td className="text-muted">{s.cpf}</td>
                  <td className="text-muted">{formatAnimal(s)}</td>
                  <td className="text-muted small">{formatData(s.dataSolicitacao)}</td>
                  <td>
                    <span className={`badge ${badgeStatus(s.status)}`}>{s.status}</span>
                  </td>
                  <td>
                    <div className="d-flex gap-1 flex-wrap align-items-center">
                      <FormSelect
                        className="form-select-sm"
                        style={{ minWidth: 130, maxWidth: 160 }}
                        value={s.status}
                        disabled={salvandoStatusId === s.id}
                        onChange={(e) => onStatusChange?.(s, e.target.value)}
                      >
                        <option>Pendente</option>
                        <option>Em análise</option>
                        <option>Aprovada</option>
                        <option>Recusada</option>
                        <option>Concluída</option>
                      </FormSelect>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        title="Editar"
                        onClick={() => navigate(`/adocoes/${s.id}/editar`)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        title="Excluir"
                        onClick={() => setConfirmId(s.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        show={!!confirmId}
        nome={confirmTarget?.nomeAdotante}
        onConfirm={() => {
          onDelete(confirmId);
          setConfirmId(null);
        }}
        onCancel={() => setConfirmId(null)}
      />
    </>
  );
}
