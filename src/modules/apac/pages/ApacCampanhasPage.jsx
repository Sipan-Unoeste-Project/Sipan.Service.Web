import { useState, useEffect } from 'react';
import PageShell from '../../../components/PageShell';
import ApacTabs from '../components/ApacTabs';
import {
  loadCampanhas,
  saveCampanhas,
  parseValor,
  getDataAtual,
  formatBRL,
} from '../storage/apacStorage';

const emptyForm = { nome: '', descricao: '', data: getDataAtual(), meta: '' };

export default function ApacCampanhasPage() {
  const [dados, setDados] = useState({ ativas: [], encerradas: [] });
  const [tab, setTab] = useState('ativas');
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setDados(loadCampanhas());
  }, []);

  useEffect(() => {
    if (msg) {
      const t = setTimeout(() => setMsg(''), 3000);
      return () => clearTimeout(t);
    }
  }, [msg]);

  function persist(next) {
    setDados(next);
    saveCampanhas(next);
  }

  function abrirForm(campanha = null) {
    if (campanha) {
      setEditando(campanha);
      setForm({
        nome: campanha.nome,
        descricao: campanha.descricao,
        data: campanha.data,
        meta: String(campanha.meta),
      });
    } else {
      setEditando(null);
      setForm({ ...emptyForm, data: getDataAtual() });
    }
    setTab('nova');
  }

  function salvar(e) {
    e.preventDefault();
    const meta = parseValor(form.meta);
    if (editando) {
      const atualizar = (lista) =>
        lista.map((c) =>
          c.id === editando.id
            ? { ...c, nome: form.nome, descricao: form.descricao, data: form.data, meta }
            : c
        );
      persist({
        ativas: atualizar(dados.ativas),
        encerradas: atualizar(dados.encerradas),
      });
      setMsg('Campanha atualizada.');
    } else {
      persist({
        ...dados,
        ativas: [
          ...dados.ativas,
          {
            id: Date.now(),
            nome: form.nome,
            descricao: form.descricao,
            data: form.data,
            meta,
            arrecadado: 0,
            status: 'planejada',
          },
        ],
      });
      setMsg('Campanha criada.');
    }
    setTab('ativas');
    setEditando(null);
    setForm({ ...emptyForm, data: getDataAtual() });
  }

  function excluir(id, tipo) {
    if (!window.confirm('Excluir campanha?')) return;
    persist({
      ...dados,
      ativas: tipo === 'ativas' ? dados.ativas.filter((c) => c.id !== id) : dados.ativas,
      encerradas:
        tipo === 'encerradas' ? dados.encerradas.filter((c) => c.id !== id) : dados.encerradas,
    });
    setMsg('Campanha excluída.');
  }

  function registrarDoacao(id) {
    const valor = window.prompt('Valor da doação (R$):');
    if (!valor) return;
    const v = parseValor(valor);
    persist({
      ...dados,
      ativas: dados.ativas.map((c) =>
        c.id === id ? { ...c, arrecadado: c.arrecadado + v } : c
      ),
    });
    setMsg(`Doação de ${formatBRL(v)} registrada.`);
  }

  const lista = tab === 'encerradas' ? dados.encerradas : dados.ativas;
  const tipoLista = tab === 'encerradas' ? 'encerradas' : 'ativas';

  return (
    <PageShell
      title="Campanhas"
      subtitle="Eventos e metas de arrecadação"
      action={
        <button type="button" className="btn btn-success" onClick={() => abrirForm()}>
          + Nova campanha
        </button>
      }
    >
      {msg && <div className="alert alert-success py-2">{msg}</div>}

      <ApacTabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'ativas', label: `Ativas (${dados.ativas.length})` },
          { id: 'encerradas', label: `Encerradas (${dados.encerradas.length})` },
          { id: 'nova', label: editando ? 'Editar' : 'Nova campanha' },
        ]}
      />

      {tab === 'nova' && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <form onSubmit={salvar}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Nome</label>
                  <input
                    className="form-control"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Data</label>
                  <input
                    className="form-control"
                    value={form.data}
                    onChange={(e) => setForm({ ...form, data: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Meta (R$)</label>
                  <input
                    className="form-control"
                    value={form.meta}
                    onChange={(e) => setForm({ ...form, meta: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Descrição</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={form.descricao}
                    onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="d-flex gap-2 mt-3">
                <button type="submit" className="btn btn-success">
                  Salvar
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setTab('ativas')}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {(tab === 'ativas' || tab === 'encerradas') && (
        <div className="row g-3">
          {lista.length === 0 ? (
            <div className="col-12 text-muted text-center py-4">Nenhuma campanha.</div>
          ) : (
            lista.map((c) => {
              const pct = c.meta > 0 ? Math.min(100, (c.arrecadado / c.meta) * 100) : 0;
              return (
                <div className="col-md-6" key={c.id}>
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="fw-semibold mb-0">{c.nome}</h5>
                        <span className="badge bg-success">{c.status}</span>
                      </div>
                      <p className="text-muted small">{c.descricao}</p>
                      <p className="small mb-2">Data: {c.data}</p>
                      <div className="progress mb-2" style={{ height: 8 }}>
                        <div
                          className="progress-bar bg-success"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="small mb-3">
                        {formatBRL(c.arrecadado)} de {formatBRL(c.meta)} ({pct.toFixed(0)}%)
                      </p>
                      <div className="d-flex flex-wrap gap-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => abrirForm(c)}
                        >
                          Editar
                        </button>
                        {tab === 'ativas' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-success"
                            onClick={() => registrarDoacao(c.id)}
                          >
                            Doar
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => excluir(c.id, tipoLista)}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </PageShell>
  );
}
