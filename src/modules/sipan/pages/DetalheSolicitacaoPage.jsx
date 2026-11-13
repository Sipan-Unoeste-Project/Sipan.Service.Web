import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '../../../api/client';
import * as adocoesApi from '../../../api/adocoesApi';
import PageShell from '../../../components/PageShell';
import ConfirmModal from '../../../components/ConfirmModal';

const STATUS_DECIDIVEIS = ['Pendente', 'Em análise'];

const STATUS_BADGE = {
  Pendente: 'secondary',
  'Em análise': 'info',
  Aprovada: 'success',
  Recusada: 'danger',
  Concluída: 'success',
};

function formatData(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
}

function formatDataHora(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function Campo({ label, value }) {
  return (
    <div className="col-md-6">
      <div
        className="text-muted text-uppercase"
        style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}
      >
        {label}
      </div>
      <div className="fw-medium">{value || '—'}</div>
    </div>
  );
}

export default function DetalheSolicitacaoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [solicitacao, setSolicitacao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [erroAcao, setErroAcao] = useState('');
  const [decisao, setDecisao] = useState(null); // 'Aprovada' | 'Recusada' | null
  const [processando, setProcessando] = useState(false);
  const [movendoAnalise, setMovendoAnalise] = useState(false);
  const [concluindo, setConcluindo] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErro('');
      try {
        const data = await adocoesApi.getAdocao(id);
        if (!cancelled) setSolicitacao(data);
      } catch (err) {
        if (!cancelled) {
          setErro(
            err instanceof ApiError ? err.message : 'Não foi possível carregar a solicitação.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function moverParaAnalise() {
    if (!solicitacao) return;
    setMovendoAnalise(true);
    setErroAcao('');
    try {
      const atualizada = await adocoesApi.updateAdocao(
        solicitacao.id,
        adocoesApi.toAdocaoBody({ ...solicitacao, status: 'Em análise' })
      );
      setSolicitacao(atualizada);
    } catch (err) {
      setErroAcao(err instanceof ApiError ? err.message : 'Erro ao atualizar a solicitação.');
    } finally {
      setMovendoAnalise(false);
    }
  }

  async function marcarConcluida() {
    if (!solicitacao || !solicitacao.termoAssinado) return;
    setConcluindo(true);
    setErroAcao('');
    try {
      const atualizada = await adocoesApi.updateAdocao(
        solicitacao.id,
        adocoesApi.toAdocaoBody({ ...solicitacao, status: 'Concluída' })
      );
      setSolicitacao(atualizada);
    } catch (err) {
      setErroAcao(err instanceof ApiError ? err.message : 'Erro ao atualizar a solicitação.');
    } finally {
      setConcluindo(false);
    }
  }

  async function confirmarDecisao() {
    if (!solicitacao || !decisao) return;
    setProcessando(true);
    setErroAcao('');
    try {
      await adocoesApi.updateAdocao(
        solicitacao.id,
        adocoesApi.toAdocaoBody({ ...solicitacao, status: decisao })
      );
      navigate('/adocoes', {
        state: {
          toast:
            decisao === 'Aprovada'
              ? 'Solicitação aprovada! O animal foi marcado como adotado.'
              : 'Solicitação recusada.',
        },
      });
    } catch (err) {
      setErroAcao(err instanceof ApiError ? err.message : 'Erro ao atualizar a solicitação.');
      setProcessando(false);
      setDecisao(null);
    }
  }

  if (loading) {
    return (
      <PageShell title="Solicitação de Adoção">
        <div className="text-muted py-4">Carregando...</div>
      </PageShell>
    );
  }

  if (erro || !solicitacao) {
    return (
      <PageShell title="Solicitação não encontrada">
        <div className="text-center py-4">
          <p className="text-muted mb-3">
            {erro || 'O registro solicitado não existe ou foi removido.'}
          </p>
          <Link to="/adocoes" className="btn btn-outline-secondary">
            Voltar à lista
          </Link>
        </div>
      </PageShell>
    );
  }

  const s = solicitacao;
  const animalLabel = s.animalNome
    ? `${s.animalNome}${s.animalEspecie ? ` (${s.animalEspecie})` : ''}`
    : '—';

  return (
    <PageShell
      title={`Solicitação de ${s.nomeAdotante}`}
      subtitle={`Enviada em ${formatData(s.dataSolicitacao)}`}
      action={
        <div className="d-flex gap-2">
          <Link to="/adocoes" className="btn btn-outline-secondary">
            Voltar à lista
          </Link>
          <Link to={`/adocoes/${s.id}/editar`} className="btn btn-outline-secondary">
            Editar dados
          </Link>
        </div>
      }
    >
      {erroAcao && <div className="alert alert-danger py-2">{erroAcao}</div>}

      <div className="card border-0 shadow-sm" style={{ maxWidth: 820 }}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h6
              className="text-muted text-uppercase mb-0"
              style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}
            >
              Status atual
            </h6>
            <span
              className={`badge bg-${STATUS_BADGE[s.status] || 'secondary'}`}
              style={{ fontSize: '0.85rem' }}
            >
              {s.status}
            </span>
          </div>

          <h6
            className="text-muted text-uppercase mb-3"
            style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}
          >
            Dados do Adotante
          </h6>
          <div className="row g-3 mb-4">
            <Campo label="Nome completo" value={s.nomeAdotante} />
            <Campo label="CPF" value={s.cpf} />
            <Campo label="Telefone" value={s.telefone} />
            <Campo label="E-mail" value={s.email} />
            <div className="col-12">
              <Campo label="Endereço" value={s.endereco} />
            </div>
          </div>

          <h6
            className="text-muted text-uppercase mb-3"
            style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}
          >
            Dados da Adoção
          </h6>
          <div className="row g-3 mb-4">
            <Campo label="Animal desejado" value={animalLabel} />
            <Campo label="Tipo de residência" value={s.tipoResidencia} />
            <Campo label="Possui outros animais?" value={s.temOutrosAnimais} />
            <Campo label="Possui crianças em casa?" value={s.temCriancas} />
            <div className="col-12">
              <Campo label="Motivo da adoção" value={s.motivo} />
            </div>
          </div>

          <h6
            className="text-muted text-uppercase mb-3"
            style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}
          >
            Termo de Responsabilidade
          </h6>
          <div className="mb-4">
            <p className="mb-2">
              {s.aceitaTermo ? (
                <span className="text-success">✓ Ciência do termo registrada no pedido de adoção.</span>
              ) : (
                <span className="text-danger">O adotante não registrou ciência do termo.</span>
              )}
            </p>

            {s.termoAssinado ? (
              <div className="alert alert-success py-2 mb-0">
                <strong>Termo assinado</strong> por {s.termoAssinaturaNome} em{' '}
                {formatDataHora(s.termoAssinadoEm)}.
              </div>
            ) : s.status === 'Aprovada' ? (
              <div className="alert alert-warning py-2 mb-0">
                <strong>Aguardando assinatura do termo.</strong> O adotante assina na página pública{' '}
                <Link to="/publico/termo">Assinar Termo</Link>, informando o CPF e o e-mail usados
                no pedido.
              </div>
            ) : s.status === 'Concluída' ? (
              <div className="alert alert-secondary py-2 mb-0">
                Assinatura do termo não registrada para esta adoção.
              </div>
            ) : (
              <p className="text-muted small mb-0">
                O adotante poderá assinar o termo depois que a solicitação for aprovada.
              </p>
            )}
          </div>

          {STATUS_DECIDIVEIS.includes(s.status) ? (
            <div className="d-flex gap-2 pt-3 border-top">
              {s.status === 'Pendente' && (
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={moverParaAnalise}
                  disabled={movendoAnalise}
                >
                  {movendoAnalise ? 'Movendo…' : 'Colocar em Análise'}
                </button>
              )}
              <button
                type="button"
                className="btn btn-success"
                onClick={() => setDecisao('Aprovada')}
              >
                Aprovar Adoção
              </button>
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={() => setDecisao('Recusada')}
              >
                Recusar Solicitação
              </button>
            </div>
          ) : s.status === 'Aprovada' ? (
            <div className="d-flex gap-2 pt-3 border-top">
              <button
                type="button"
                className="btn btn-success"
                onClick={marcarConcluida}
                disabled={concluindo || !s.termoAssinado}
              >
                {concluindo ? 'Salvando…' : 'Marcar como Concluída'}
              </button>
              <span className="text-muted small align-self-center">
                {s.termoAssinado
                  ? 'Use quando o adotante já retirou o animal.'
                  : 'Disponível depois que o adotante assinar o termo.'}
              </span>
            </div>
          ) : (
            <p className="text-muted small pt-3 border-top mb-0">
              Esta solicitação está com status <strong>{s.status}</strong> e não tem mais ações
              disponíveis por aqui.
            </p>
          )}
        </div>
      </div>

      <ConfirmModal
        show={!!decisao}
        title={decisao === 'Aprovada' ? 'Aprovar solicitação' : 'Recusar solicitação'}
        confirmLabel={processando ? 'Salvando…' : decisao === 'Aprovada' ? 'Aprovar' : 'Recusar'}
        confirmVariant={decisao === 'Aprovada' ? 'success' : 'danger'}
        message={
          decisao === 'Aprovada' ? (
            <>
              Aprovar a adoção de <strong>{animalLabel}</strong> por{' '}
              <strong>{s.nomeAdotante}</strong>? O animal será marcado como{' '}
              <strong>Adotado</strong> e as demais solicitações em andamento para ele serão
              recusadas automaticamente.
            </>
          ) : (
            <>
              Recusar a solicitação de <strong>{s.nomeAdotante}</strong> para{' '}
              <strong>{animalLabel}</strong>?
            </>
          )
        }
        onConfirm={confirmarDecisao}
        onCancel={() => setDecisao(null)}
      />
    </PageShell>
  );
}
