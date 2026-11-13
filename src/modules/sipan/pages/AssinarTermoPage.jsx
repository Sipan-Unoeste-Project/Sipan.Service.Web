import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../../../api/client';
import * as adocoesApi from '../../../api/adocoesApi';
import PageShell from '../../../components/PageShell';
import TermoResponsabilidadeTexto from '../components/TermoResponsabilidadeTexto';
import { maskCPF } from '../../../utils/masks';
import { validateCPF, validateEmail } from '../../../utils/validators';

function formatDataHora(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function animalLabel(s) {
  if (!s.animalNome) return 'Animal';
  return s.animalEspecie ? `${s.animalNome} (${s.animalEspecie})` : s.animalNome;
}

export default function AssinarTermoPage() {
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [errosId, setErrosId] = useState({});
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  // null = ainda não consultou; array = resultado da consulta
  const [resultados, setResultados] = useState(null);
  const [selecionada, setSelecionada] = useState(null);

  const [nomeAssinatura, setNomeAssinatura] = useState('');
  const [aceito, setAceito] = useState(false);
  const [errosAss, setErrosAss] = useState({});
  const [assinando, setAssinando] = useState(false);

  async function handleConsultar(event) {
    event.preventDefault();
    setErro('');
    setSucesso('');

    const errs = {};
    if (!cpf.trim()) errs.cpf = 'Informe o CPF usado na solicitação.';
    else if (!validateCPF(cpf)) errs.cpf = 'CPF inválido.';
    if (!email.trim()) errs.email = 'Informe o e-mail usado na solicitação.';
    else if (!validateEmail(email)) errs.email = 'E-mail inválido.';
    setErrosId(errs);
    if (Object.keys(errs).length > 0) return;

    setBuscando(true);
    try {
      const lista = await adocoesApi.consultarTermosAdocao({ cpf, email });
      setResultados(lista);
      setSelecionada(null);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao consultar solicitações.');
    } finally {
      setBuscando(false);
    }
  }

  function abrirTermo(solicitacao) {
    setSelecionada(solicitacao);
    setNomeAssinatura('');
    setAceito(false);
    setErrosAss({});
    setErro('');
    setSucesso('');
  }

  async function handleAssinar(event) {
    event.preventDefault();
    setErro('');

    const errs = {};
    if (nomeAssinatura.trim().split(/\s+/).filter(Boolean).length < 2) {
      errs.nome = 'Digite seu nome completo.';
    }
    if (!aceito) errs.aceito = 'Confirme que leu e concorda com o termo.';
    setErrosAss(errs);
    if (Object.keys(errs).length > 0) return;

    setAssinando(true);
    try {
      const atualizada = await adocoesApi.assinarTermoAdocao(selecionada.id, {
        cpf,
        email,
        nomeAssinatura,
        aceito,
      });
      setResultados((prev) => prev.map((s) => (s.id === atualizada.id ? atualizada : s)));
      setSelecionada(null);
      setSucesso(
        `Termo de ${animalLabel(atualizada)} assinado com sucesso em ${formatDataHora(
          atualizada.termoAssinadoEm
        )}. Obrigado por adotar!`
      );
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao assinar o termo.');
    } finally {
      setAssinando(false);
    }
  }

  function trocarDados() {
    setResultados(null);
    setSelecionada(null);
    setSucesso('');
    setErro('');
  }

  // ---------- Etapa 3: ler e assinar ----------
  if (selecionada) {
    return (
      <PageShell
        title="Assinar Termo de Responsabilidade"
        subtitle="Leia o termo com atenção antes de assinar."
        action={
          <button type="button" className="btn btn-outline-secondary" onClick={() => setSelecionada(null)}>
            Voltar
          </button>
        }
      >
        {erro && <div className="alert alert-danger py-2">{erro}</div>}

        <form onSubmit={handleAssinar} noValidate>
          <div className="card border-0 shadow-sm mb-3" style={{ maxWidth: 820 }}>
            <div
              className="card-body p-4"
              style={{ maxHeight: 420, overflowY: 'auto', background: '#fbfbfb' }}
            >
              <TermoResponsabilidadeTexto
                nomeAdotante={selecionada.nomeAdotante}
                animalNome={animalLabel(selecionada)}
              />
            </div>
          </div>

          <div className="card border-0 shadow-sm" style={{ maxWidth: 820 }}>
            <div className="card-body p-4">
              <h6
                className="text-muted text-uppercase mb-3"
                style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}
              >
                Assinatura
              </h6>

              <div className="mb-3">
                <label htmlFor="nomeAssinatura" className="form-label fw-semibold">
                  Nome completo <span className="text-danger">*</span>
                </label>
                <input
                  id="nomeAssinatura"
                  type="text"
                  className={`form-control ${errosAss.nome ? 'is-invalid' : ''}`}
                  placeholder={selecionada.nomeAdotante}
                  value={nomeAssinatura}
                  onChange={(e) => {
                    setNomeAssinatura(e.target.value);
                    if (errosAss.nome) setErrosAss((p) => ({ ...p, nome: '' }));
                  }}
                  autoComplete="off"
                />
                <div className="form-text">
                  Digite o mesmo nome informado na solicitação: <strong>{selecionada.nomeAdotante}</strong>
                </div>
                {errosAss.nome && <div className="invalid-feedback d-block">{errosAss.nome}</div>}
              </div>

              <div className="form-check mb-4">
                <input
                  id="aceitoTermo"
                  type="checkbox"
                  className={`form-check-input ${errosAss.aceito ? 'is-invalid' : ''}`}
                  checked={aceito}
                  onChange={(e) => {
                    setAceito(e.target.checked);
                    if (errosAss.aceito) setErrosAss((p) => ({ ...p, aceito: '' }));
                  }}
                />
                <label className="form-check-label" htmlFor="aceitoTermo">
                  Li e concordo com todas as cláusulas do termo de responsabilidade{' '}
                  <span className="text-danger">*</span>
                </label>
                {errosAss.aceito && <div className="invalid-feedback d-block">{errosAss.aceito}</div>}
              </div>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setSelecionada(null)}
                  disabled={assinando}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-success" disabled={assinando}>
                  {assinando ? 'Assinando…' : 'Assinar Termo'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </PageShell>
    );
  }

  // ---------- Etapa 2: resultado da consulta ----------
  if (resultados) {
    return (
      <PageShell
        title="Assinar Termo de Responsabilidade"
        subtitle="Suas solicitações de adoção aprovadas."
        action={
          <button type="button" className="btn btn-outline-secondary" onClick={trocarDados}>
            Consultar com outros dados
          </button>
        }
      >
        {erro && <div className="alert alert-danger py-2">{erro}</div>}
        {sucesso && <div className="alert alert-success py-2">{sucesso}</div>}

        {resultados.length === 0 ? (
          <div className="card border-0 shadow-sm" style={{ maxWidth: 820 }}>
            <div className="card-body p-4 text-center">
              <p className="fw-semibold mb-2">Nenhuma solicitação aprovada encontrada.</p>
              <p className="text-muted mb-3">
                O termo só pode ser assinado depois que a equipe da APAC aprovar a sua solicitação.
                Confira se o CPF e o e-mail são os mesmos usados no pedido de adoção.
              </p>
              <Link to="/publico/adocao" className="btn btn-outline-success">
                Fazer uma solicitação de adoção
              </Link>
            </div>
          </div>
        ) : (
          <div className="d-grid gap-3" style={{ maxWidth: 820 }}>
            {resultados.map((s) => (
              <div key={s.id} className="card border-0 shadow-sm">
                <div className="card-body p-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
                  <div>
                    <div className="fw-semibold">{animalLabel(s)}</div>
                    <div className="text-muted small">Adotante: {s.nomeAdotante}</div>
                  </div>
                  {s.termoAssinado ? (
                    <span className="badge bg-success" style={{ fontSize: '0.85rem' }}>
                      Termo assinado em {formatDataHora(s.termoAssinadoEm)}
                    </span>
                  ) : (
                    <button type="button" className="btn btn-success" onClick={() => abrirTermo(s)}>
                      Ler e assinar o termo
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </PageShell>
    );
  }

  // ---------- Etapa 1: identificação ----------
  return (
    <PageShell
      title="Assinar Termo de Responsabilidade"
      subtitle="Informe os dados usados na sua solicitação de adoção para localizar o termo."
    >
      {erro && <div className="alert alert-danger py-2">{erro}</div>}

      <div className="card border-0 shadow-sm" style={{ maxWidth: 560 }}>
        <div className="card-body p-4">
          <form onSubmit={handleConsultar} noValidate>
            <div className="mb-3">
              <label htmlFor="cpfTermo" className="form-label fw-semibold">
                CPF <span className="text-danger">*</span>
              </label>
              <input
                id="cpfTermo"
                type="text"
                className={`form-control ${errosId.cpf ? 'is-invalid' : ''}`}
                placeholder="000.000.000-00"
                maxLength={14}
                value={cpf}
                onChange={(e) => {
                  setCpf(maskCPF(e.target.value));
                  if (errosId.cpf) setErrosId((p) => ({ ...p, cpf: '' }));
                }}
              />
              {errosId.cpf && <div className="invalid-feedback">{errosId.cpf}</div>}
            </div>

            <div className="mb-4">
              <label htmlFor="emailTermo" className="form-label fw-semibold">
                E-mail <span className="text-danger">*</span>
              </label>
              <input
                id="emailTermo"
                type="email"
                className={`form-control ${errosId.email ? 'is-invalid' : ''}`}
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errosId.email) setErrosId((p) => ({ ...p, email: '' }));
                }}
              />
              {errosId.email && <div className="invalid-feedback">{errosId.email}</div>}
            </div>

            <button type="submit" className="btn btn-success" disabled={buscando}>
              {buscando ? 'Buscando…' : 'Buscar minha solicitação'}
            </button>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
