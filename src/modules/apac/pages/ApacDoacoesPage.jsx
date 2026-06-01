import { useState, useEffect, useCallback } from 'react';
import { ApiError } from '../../../api/client';
import * as doacoesApi from '../../../api/doacoesApi';
import PageShell from '../../../components/PageShell';
import FeedbackAlert from '../../../components/FeedbackAlert';
import { useTimedMessage } from '../../../hooks/useTimedMessage';
import { parseValor, formatBRL } from '../storage/apacStorage';

const PIX_KEY = 'apac@cananeia.org.br';

const emptyDinheiro = {
  nome: '',
  telefone: '',
  email: '',
  valor: '',
  pagamento: 'PIX',
  campanha: '',
  mensagem: '',
  anonimo: false,
};

const emptyItem = { produto: 'Ração para cães', quantidade: '1', unidade: 'Unidade(s)' };

export default function ApacDoacoesPage() {
  const [doacoes, setDoacoes] = useState([]);
  const [tipo, setTipo] = useState('dinheiro');
  const [formD, setFormD] = useState(emptyDinheiro);
  const [itens, setItens] = useState([emptyItem]);
  const [formP, setFormP] = useState({
    nome: '',
    telefone: '',
    email: '',
    mensagem: '',
    anonimo: false,
  });
  const [msg, setMsg] = useTimedMessage(4000);
  const [erro, setErro] = useTimedMessage(6000);

  const carregar = useCallback(async () => {
    try {
      const lista = await doacoesApi.listDoacoes();
      setDoacoes(lista.map(doacoesApi.mapDoacaoUi));
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar doações. Verifique a API e o schema APAC.'
      );
    }
  }, [setErro]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function enviarDinheiro(e) {
    e.preventDefault();
    const valor = parseValor(formD.valor);
    if (!Number.isFinite(valor) || valor <= 0) {
      setErro('Informe um valor válido maior que zero.');
      return;
    }
    try {
      await doacoesApi.createDoacaoDinheiro({
        ...formD,
        valor,
      });
      setFormD(emptyDinheiro);
      setMsg('Doação registrada. Use a chave PIX abaixo para concluir o pagamento.');
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao registrar doação.');
    }
  }

  async function enviarProduto(e) {
    e.preventDefault();
    try {
      await doacoesApi.createDoacaoProduto(formP, itens);
      setFormP({ nome: '', telefone: '', email: '', mensagem: '', anonimo: false });
      setItens([emptyItem]);
      setMsg('Doação de produtos registrada. Entraremos em contato.');
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao registrar doação.');
    }
  }

  return (
    <PageShell
      title="Doações"
      subtitle="Registre doações em dinheiro (PIX) ou produtos para o abrigo"
    >
      <FeedbackAlert message={msg} />
      <FeedbackAlert message={erro} variant="danger" />

      <div className="btn-group mb-4" role="group">
        <button
          type="button"
          className={`btn ${tipo === 'dinheiro' ? 'btn-success' : 'btn-outline-success'}`}
          onClick={() => setTipo('dinheiro')}
        >
          Dinheiro / PIX
        </button>
        <button
          type="button"
          className={`btn ${tipo === 'produto' ? 'btn-success' : 'btn-outline-success'}`}
          onClick={() => setTipo('produto')}
        >
          Produtos / Itens
        </button>
      </div>

      {tipo === 'dinheiro' && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <form onSubmit={enviarDinheiro}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Nome</label>
                  <input
                    className="form-control"
                    value={formD.nome}
                    onChange={(e) => setFormD({ ...formD, nome: e.target.value })}
                    disabled={formD.anonimo}
                    required={!formD.anonimo}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Telefone</label>
                  <input
                    className="form-control"
                    value={formD.telefone}
                    onChange={(e) => setFormD({ ...formD, telefone: e.target.value })}
                    disabled={formD.anonimo}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">E-mail</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formD.email}
                    onChange={(e) => setFormD({ ...formD, email: e.target.value })}
                    disabled={formD.anonimo}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Valor (R$)</label>
                  <input
                    className="form-control"
                    value={formD.valor}
                    onChange={(e) => setFormD({ ...formD, valor: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Pagamento</label>
                  <select
                    className="form-select"
                    value={formD.pagamento}
                    onChange={(e) => setFormD({ ...formD, pagamento: e.target.value })}
                  >
                    <option>PIX</option>
                    <option>Transferência</option>
                    <option>Dinheiro</option>
                  </select>
                </div>
                <div className="col-12">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="anon-d"
                      checked={formD.anonimo}
                      onChange={(e) => setFormD({ ...formD, anonimo: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="anon-d">
                      Doação anônima
                    </label>
                  </div>
                </div>
              </div>
              <div className="alert alert-light border mt-3 mb-3">
                <strong>Chave PIX:</strong> {PIX_KEY}
              </div>
              <button type="submit" className="btn btn-success">
                Registrar doação
              </button>
            </form>
          </div>
        </div>
      )}

      {tipo === 'produto' && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <form onSubmit={enviarProduto}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label">Nome</label>
                  <input
                    className="form-control"
                    value={formP.nome}
                    onChange={(e) => setFormP({ ...formP, nome: e.target.value })}
                    disabled={formP.anonimo}
                    required={!formP.anonimo}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Telefone</label>
                  <input
                    className="form-control"
                    value={formP.telefone}
                    onChange={(e) => setFormP({ ...formP, telefone: e.target.value })}
                  />
                </div>
              </div>
              {itens.map((item, idx) => (
                <div className="row g-2 mb-2" key={idx}>
                  <div className="col-md-5">
                    <select
                      className="form-select"
                      value={item.produto}
                      onChange={(e) => {
                        const n = [...itens];
                        n[idx].produto = e.target.value;
                        setItens(n);
                      }}
                    >
                      <option>Ração para cães</option>
                      <option>Ração para gatos</option>
                      <option>Medicamentos</option>
                      <option>Material de limpeza</option>
                      <option>Outro</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <input
                      className="form-control"
                      placeholder="Qtd"
                      value={item.quantidade}
                      onChange={(e) => {
                        const n = [...itens];
                        n[idx].quantidade = e.target.value;
                        setItens(n);
                      }}
                    />
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={item.unidade}
                      onChange={(e) => {
                        const n = [...itens];
                        n[idx].unidade = e.target.value;
                        setItens(n);
                      }}
                    >
                      <option>Unidade(s)</option>
                      <option>Kg</option>
                      <option>Pacote(s)</option>
                    </select>
                  </div>
                  {itens.length > 1 && (
                    <div className="col-md-1">
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => setItens(itens.filter((_, i) => i !== idx))}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="btn btn-sm btn-outline-success mb-3"
                onClick={() => setItens([...itens, emptyItem])}
              >
                + Adicionar item
              </button>
              <br />
              <button type="submit" className="btn btn-success">
                Registrar doação de produtos
              </button>
            </form>
          </div>
        </div>
      )}

      {doacoes.length > 0 && (
        <>
          <h6 className="fw-semibold mb-3">Últimas doações registradas</h6>
          <div className="list-group">
            {doacoes.slice(0, 10).map((d) => (
              <div key={d.id} className="list-group-item">
                <div className="d-flex justify-content-between">
                  <strong>
                    {d.tipo === 'dinheiro'
                      ? `Dinheiro — ${d.anonimo ? 'Anônimo' : d.nome}`
                      : `Produtos — ${d.anonimo ? 'Anônimo' : d.nome}`}
                  </strong>
                  <span className="text-muted small">{d.data}</span>
                </div>
                {d.tipo === 'dinheiro' && (
                  <span className="text-success">{formatBRL(d.valor)}</span>
                )}
                {d.tipo === 'produto' && (
                  <span className="small text-muted">
                    {d.itens?.map((i) => `${i.produto} (${i.quantidade})`).join(', ')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </PageShell>
  );
}
