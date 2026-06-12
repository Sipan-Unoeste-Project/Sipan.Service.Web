import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ApiError } from '../../../api/client';
import * as adocoesApi from '../../../api/adocoesApi';
import { listAnimais, getAnimal } from '../../../api/animaisApi';
import PageShell from '../../../components/PageShell';
import SolicitacaoAdocaoForm from '../components/SolicitacaoAdocaoForm';

async function carregarAnimaisParaEdicao(animalId) {
  const disponiveis = await listAnimais({ status: 'Disponível' });
  const idNum = Number(animalId);
  if (idNum && !disponiveis.some((a) => a.id === idNum)) {
    try {
      const atual = await getAnimal(idNum);
      return [atual, ...disponiveis];
    } catch {
      return disponiveis;
    }
  }
  return disponiveis;
}

export default function EditarSolicitacaoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [solicitacao, setSolicitacao] = useState(null);
  const [animais, setAnimais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await adocoesApi.getAdocao(id);
        const listaAnimais = await carregarAnimaisParaEdicao(data.animalId);
        if (!cancelled) {
          setSolicitacao(data);
          setAnimais(
            listaAnimais.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }))
          );
        }
      } catch {
        if (!cancelled) setSolicitacao(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <PageShell title="Editar Solicitação">
        <div className="text-muted py-4">Carregando...</div>
      </PageShell>
    );
  }

  if (!solicitacao) {
    return (
      <PageShell title="Solicitação não encontrada">
        <div className="text-center py-4">
          <p className="text-muted mb-3">O registro solicitado não existe ou foi removido.</p>
          <Link to="/adocoes" className="btn btn-outline-secondary">
            Voltar à lista
          </Link>
        </div>
      </PageShell>
    );
  }

  async function handleSubmit(form) {
    setErro('');
    try {
      await adocoesApi.updateAdocao(solicitacao.id, adocoesApi.toAdocaoBody(form));
      navigate('/adocoes', { state: { toast: 'Solicitação atualizada com sucesso!' } });
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao atualizar solicitação.');
      throw err;
    }
  }

  return (
    <PageShell
      title="Editar Solicitação"
      subtitle={`Atualize os dados da solicitação de ${solicitacao.nomeAdotante}.`}
      action={
        <Link to="/adocoes" className="btn btn-outline-secondary">
          Voltar à lista
        </Link>
      }
    >
      {erro && <div className="alert alert-danger py-2">{erro}</div>}

      <div className="card border-0 shadow-sm" style={{ maxWidth: 820 }}>
        <div className="card-body p-4">
          <SolicitacaoAdocaoForm
            initialData={solicitacao}
            animais={animais}
            isEditing
            onSubmit={handleSubmit}
            onCancel={() => navigate('/adocoes')}
            submitLabel="Salvar Alterações"
          />
        </div>
      </div>
    </PageShell>
  );
}
