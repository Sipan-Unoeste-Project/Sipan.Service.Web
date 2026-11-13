import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../../components/ConfirmModal';
import ActionIconButtons from '../../../components/ActionIconButtons';

const STATUS_FILTRO = ['todos', 'Pendente', 'Em análise', 'Aprovada', 'Recusada', 'Concluída'];
const STATUS_DECIDIVEIS = ['Pendente', 'Em análise'];

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

function TermoBadge({ s }) {
  if (s.termoAssinado) {
    return <span className="badge bg-success">Assinado</span>;
  }
  if (s.status === 'Aprovada') {
    return <span className="badge bg-warning text-dark">Aguardando assinatura</span>;
  }
  if (s.status === 'Concluída') {
    return <span className="badge bg-secondary">Não registrado</span>;
  }
  return <span className="text-muted">—</span>;
}


export default function AdocaoTable({ solicitacoes, onDelete, onDecidir }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos');
  const [confirmId, setConfirmId] = useState(null);
  const [decisao, setDecisao] = useState(null); // { id, status: 'Aprovada' | 'Recusada' }

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

  const aguardandoTermo = solicitacoes.filter(
    (s) => s.status === 'Aprovada' && !s.termoAssinado
  ).length;

  const confirmTarget = confirmId ? solicitacoes.find((s) => s.id === confirmId) : null;
  const decisaoTarget = decisao ? solicitacoes.find((s) => s.id === decisao.id) : null;

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
              {st === 'Aprovada' && aguardandoTermo > 0 && (
                <span
                  className="badge bg-warning text-dark ms-1"
                  title={`${aguardandoTermo} aguardando assinatura do termo`}
                >
                  {aguardandoTermo}
                </span>
              )}
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
        <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Adotante</th>
                <th>CPF</th>
                <th>Animal</th>
                <th>Data</th>
                <th>Status</th>
                <th>Termo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => navigate(`/adocoes/${s.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="fw-medium">{s.nomeAdotante}</td>
                  <td className="text-muted">{s.cpf}</td>
                  <td className="text-muted">{formatAnimal(s)}</td>
                  <td className="text-muted small">{formatData(s.dataSolicitacao)}</td>
                  <td className="text-muted">{s.status}</td>
                  <td>
                    <TermoBadge s={s} />
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    {s.status === 'Pendente' && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary me-1"
                        title="Colocar em análise"
                        onClick={() => onDecidir(s, 'Em análise')}
                      >
                        Em análise
                      </button>
                    )}
                    {STATUS_DECIDIVEIS.includes(s.status) && (
                      <>
                        <button
                          type="button"
                          className="btn btn-sm btn-success me-1"
                          title="Aprovar solicitação"
                          onClick={() => setDecisao({ id: s.id, status: 'Aprovada' })}
                        >
                          Aprovar
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger me-1"
                          title="Recusar solicitação"
                          onClick={() => setDecisao({ id: s.id, status: 'Recusada' })}
                        >
                          Recusar
                        </button>
                      </>
                    )}
                    {s.status === 'Aprovada' && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-success me-1"
                        title={
                          s.termoAssinado
                            ? 'Marcar como concluída'
                            : 'Disponível após o adotante assinar o termo'
                        }
                        disabled={!s.termoAssinado}
                        onClick={() => onDecidir(s, 'Concluída')}
                      >
                        Concluir
                      </button>
                    )}
                    <ActionIconButtons
                      onEdit={() => navigate(`/adocoes/${s.id}/editar`)}
                      onDelete={() => setConfirmId(s.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

      <ConfirmModal
        show={!!decisao}
        title={decisao?.status === 'Aprovada' ? 'Aprovar solicitação' : 'Recusar solicitação'}
        confirmLabel={decisao?.status === 'Aprovada' ? 'Aprovar' : 'Recusar'}
        confirmVariant={decisao?.status === 'Aprovada' ? 'success' : 'danger'}
        message={
          decisao?.status === 'Aprovada' ? (
            <>
              Aprovar a adoção de <strong>{formatAnimal(decisaoTarget || {})}</strong> por{' '}
              <strong>{decisaoTarget?.nomeAdotante}</strong>? O animal será marcado como{' '}
              <strong>Adotado</strong> e as demais solicitações em andamento para ele serão
              recusadas automaticamente.
            </>
          ) : (
            <>
              Recusar a solicitação de <strong>{decisaoTarget?.nomeAdotante}</strong> para{' '}
              <strong>{formatAnimal(decisaoTarget || {})}</strong>?
            </>
          )
        }
        onConfirm={() => {
          onDecidir(decisaoTarget, decisao.status);
          setDecisao(null);
        }}
        onCancel={() => setDecisao(null)}
      />
    </>
  );
}
