import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../../../api/client';
import * as adocoesApi from '../../../api/adocoesApi';
import { listAnimais } from '../../../api/animaisApi';
import PageShell from '../../../components/PageShell';
import SolicitacaoAdocaoForm from '../components/SolicitacaoAdocaoForm';
import { useAuth } from '../../../context/AuthContext';

export default function NovaSolicitacaoPage() {
  const navigate = useNavigate();
  const { autenticado } = useAuth();
  const [animais, setAnimais] = useState([]);
  const [loadingAnimais, setLoadingAnimais] = useState(true);
  const [erro, setErro] = useState('');
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const lista = await listAnimais({ status: 'Disponível' });
        if (!cancelled) {
          setAnimais(
            lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }))
          );
        }
      } catch (err) {
        if (!cancelled) {
          setErro(
            err instanceof ApiError
              ? err.message
              : 'Não foi possível carregar os animais disponíveis.'
          );
        }
      } finally {
        if (!cancelled) setLoadingAnimais(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(form) {
    setErro('');
    try {
      await adocoesApi.createAdocao(adocoesApi.toAdocaoBody(form));

      if (autenticado) {
        // Admin/equipe cadastrando manualmente: volta para a lista de solicitações.
        navigate('/adocoes', { state: { toast: 'Solicitação registrada com sucesso!' } });
      } else {
        // Visitante público: mostra tela de agradecimento na mesma página.
        setEnviado(true);
      }
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao registrar solicitação.');
      throw err;
    }
  }

  if (enviado) {
    return (
      <PageShell
        title="Solicitação enviada!"
        subtitle="Recebemos seu pedido de adoção."
      >
        <div className="card border-0 shadow-sm" style={{ maxWidth: 820 }}>
          <div className="card-body p-4 text-center">
            <h5 className="mb-3">Obrigado pelo interesse em adotar! 🐾</h5>
            <p className="text-muted mb-4">
              Sua solicitação foi registrada com status <strong>Pendente</strong> e será avaliada
              pela nossa equipe. Em breve entraremos em contato pelo telefone ou e-mail informado.
            </p>
            <p className="text-muted mb-4">
              Quando ela for <strong>aprovada</strong>, volte em <strong>Assinar Termo</strong> e use o
              CPF e o e-mail informados para assinar o termo de responsabilidade.
            </p>
            <div className="d-flex gap-2 justify-content-center flex-wrap">
              <Link to="/publico/termo" className="btn btn-outline-success">
                Ir para Assinar Termo
              </Link>
              <Link to="/publico/animais" className="btn btn-success">
                Ver outros animais
              </Link>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  const voltarPara = autenticado ? '/adocoes' : '/publico/animais';

  return (
    <PageShell
      title="Nova Solicitação"
      subtitle="Preencha os dados para registrar uma nova solicitação de adoção."
      action={
        <Link to={voltarPara} className="btn btn-outline-secondary">
          Voltar
        </Link>
      }
    >
      {erro && <div className="alert alert-danger py-2">{erro}</div>}

      <div className="card border-0 shadow-sm" style={{ maxWidth: 820 }}>
        <div className="card-body p-4">
          {loadingAnimais ? (
            <p className="text-muted mb-0">Carregando animais disponíveis...</p>
          ) : (
            <SolicitacaoAdocaoForm
              animais={animais}
              onSubmit={handleSubmit}
              onCancel={() => navigate(voltarPara)}
              submitLabel="Enviar Solicitação"
            />
          )}
        </div>
      </div>
    </PageShell>
  );
}
