import { useState, useEffect, useCallback } from 'react';
import { ApiError } from '../../../api/client';
import * as campanhasApi from '../../../api/campanhasApi';
import { getDataAtualIso } from '../../../utils/dates';
import PageShell from '../../../components/PageShell';
import ApacTabs from '../components/ApacTabs';
import ConfirmModal from '../../../components/ConfirmModal';
import FeedbackAlert from '../../../components/FeedbackAlert';
import { useTimedMessage } from '../../../hooks/useTimedMessage';
import { parseValor, formatBRL } from '../storage/apacStorage';

const emptyForm = { nome: '', descricao: '', data: getDataAtualIso(), meta: '' };

export default function ApacCampanhasPage() {
  const [dados, setDados] = useState({ ativas: [], encerradas: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('ativas');
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useTimedMessage(3000);
  const [erro, setErro] = useTimedMessage(6000);
  const [excluirId, setExcluirId] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await campanhasApi.listCampanhas();
      setDados({
        ativas: (res.ativas || []).map(campanhasApi.mapCampanhaUi),
        encerradas: (res.encerradas || []).map(campanhasApi.mapCampanhaUi),
      });
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar campanhas. Execute database/apac_schema.sql se necessário.'
      );
      setDados({ ativas: [], encerradas: [] });
    } finally {
      setLoading(false);
    }
  }, [setErro]);

  useEffect(() => {
    if (tab !== 'nova') carregar();
  }, [carregar, tab]);

  function abrirForm(campanha = null) {
    if (campanha) {
      setEditando(campanha);
      setForm({
        nome: campanha.nome,
        descricao: campanha.descricao || '',
        data: campanha.data,
        meta: String(campanha.meta),
      });
    } else {
      setEditando(null);
      setForm({ ...emptyForm, data: getDataAtualIso() });
    }
    setTab('nova');
  }

  async function salvar(e) {
    e.preventDefault();
    const body = campanhasApi.formToCampanhaBody(form, editando?.status || 'planejada');

    try {
      if (editando) {
        await campanhasApi.updateCampanha(editando.id, body);
        setMsg('Campanha atualizada.');
      } else {
        await campanhasApi.createCampanha(body);
        setMsg('Campanha criada.');
      }
      setTab('ativas');
      setEditando(null);
      setForm({ ...emptyForm, data: getDataAtualIso() });
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao salvar campanha.');
    }
  }

  async function confirmarExclusao() {
    if (!excluirId) return;
    try {
      await campanhasApi.deleteCampanha(excluirId);
      setExcluirId(null);
      setMsg('Campanha excluída.');
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao excluir campanha.');
      setExcluirId(null);
    }
  }

  async function registrarDoacao(id) {
    const valor = window.prompt('Valor da doação (R$):');
    if (!valor) return;
    const v = parseValor(valor);
    if (v <= 0) {
      setErro('Informe um valor positivo.');
      return;
    }
    try {
      await campanhasApi.registrarDoacaoCampanha(id, v);
      setMsg(`Doação de ${formatBRL(v)} registrada.`);
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao registrar doação.');
    }
  }

  const lista = tab === 'encerradas' ? dados.encerradas : dados.ativas;

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
      <FeedbackAlert message={msg} />
      <FeedbackAlert message={erro} variant="danger" />

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
                  <label className="form-label">Data do evento</label>
                  <input
                    type="date"
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
                  onClick={() => {
                    setTab('ativas');
                    setEditando(null);
                  }}
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
          {loading ? (
            <div className="col-12 text-muted text-center py-4">Carregando...</div>
          ) : lista.length === 0 ? (
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
                          onClick={() => setExcluirId(c.id)}
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

      <ConfirmModal
        show={!!excluirId}
        message="Deseja excluir esta campanha?"
        onConfirm={confirmarExclusao}
        onCancel={() => setExcluirId(null)}
      />
    </PageShell>
  );
}
