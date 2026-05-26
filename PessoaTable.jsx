import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';

const TIPO_LABEL  = { doador: 'Doador',   adotante: 'Adotante',   voluntario: 'Voluntário' };
const TIPO_PLURAL = { doador: 'Doadores', adotante: 'Adotantes', voluntario: 'Voluntários' };

const BADGE_CLASS = {
  doador: 'bg-primary',
  adotante: 'text-white',
  voluntario: 'bg-warning text-dark',
};

const BADGE_STYLE = {
  adotante: { backgroundColor: '#6f42c1' },
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

/**
 * Tabela de listagem de pessoas com busca, filtro por tipo e exclusão.
 *
 * @param {{ pessoas: Array, onDelete: Function }} props
 */
export default function PessoaTable({ pessoas, onDelete }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos');
  const [confirmId, setConfirmId] = useState(null);

  const filtered = pessoas.filter((p) => {
    const matchTipo = filter === 'todos' || p.tipo === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.nome.toLowerCase().includes(q) ||
      p.cpf.includes(q) ||
      p.telefone.includes(q) ||
      p.email.toLowerCase().includes(q);
    return matchTipo && matchSearch;
  });

  const confirmTarget = confirmId ? pessoas.find((p) => p.id === confirmId) : null;

  function handleDeleteConfirm() {
    onDelete(confirmId);
    setConfirmId(null);
  }

  return (
    <>
      {/* Barra de busca e filtros */}
      <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
        <input
          type="search"
          className="form-control"
          style={{ maxWidth: 300 }}
          placeholder="Buscar por nome, CPF ou contato…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="btn-group" role="group" aria-label="Filtrar por tipo">
          {['todos', 'doador', 'adotante', 'voluntario'].map((t) => (
            <button
              key={t}
              type="button"
              className={`btn btn-sm ${filter === t ? 'btn-success' : 'btn-outline-secondary'}`}
              onClick={() => setFilter(t)}
            >
              {t === 'todos' ? 'Todos' : TIPO_PLURAL[t]}
            </button>
          ))}
        </div>

        <span className="ms-auto text-muted small">
          {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
        </span>
      </div>

      {/* Tabela */}
      {filtered.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <p className="mb-0 fw-semibold">
            {pessoas.length === 0
              ? 'Nenhuma pessoa cadastrada'
              : 'Nenhum resultado para a busca ou filtro selecionado.'}
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Tipo</th>
                <th>Telefone</th>
                <th>E-mail</th>
                <th>Cadastrado em</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className="fw-medium">{p.nome}</td>
                  <td className="text-muted">{p.cpf}</td>
                  <td>
                    <span
                      className={`badge ${BADGE_CLASS[p.tipo]}`}
                      style={BADGE_STYLE[p.tipo] || {}}
                    >
                      {TIPO_LABEL[p.tipo]}
                    </span>
                  </td>
                  <td>{p.telefone}</td>
                  <td className="text-muted">{p.email || '—'}</td>
                  <td className="text-muted small">{formatDate(p.criadoEm)}</td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-secondary me-1"
                      title="Editar"
                      onClick={() => navigate(`/pessoas/${p.id}/editar`)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      title="Excluir"
                      onClick={() => setConfirmId(p.id)}
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

      {/* Modal de confirmação de exclusão */}
      <ConfirmModal
        show={!!confirmId}
        nome={confirmTarget?.nome}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmId(null)}
      />
    </>
  );
}
