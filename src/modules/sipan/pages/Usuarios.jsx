import { useState, useEffect, useCallback } from 'react';
import { ApiError } from '../../../api/client';
import * as usuariosApi from '../../../api/usuariosApi';
import PageShell from '../../../components/PageShell';
import ConfirmModal from '../../../components/ConfirmModal';
import FeedbackAlert from '../../../components/FeedbackAlert';
import Toast from '../../../components/Toast';
import { useTimedMessage } from '../../../hooks/useTimedMessage';
import FormUsuario from '../components/FormUsuario';
import ListaUsuarios from '../components/ListaUsuarios';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [permissaoFiltro, setPermissaoFiltro] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [excluirId, setExcluirId] = useState(null);
  const [erro, setErro] = useTimedMessage(6000);
  const [toast, setToast] = useTimedMessage(3500);

  const carregar = useCallback(async () => {
    setLoading(true);

    try {
      const lista = await usuariosApi.listUsuarios({
        busca: busca || undefined,
      });

      let resultado = [...lista];

      if (statusFiltro) {
        resultado = resultado.filter(
          (u) => u.status === statusFiltro
        );
      }

      if (permissaoFiltro) {
        resultado = resultado.filter(
          (u) => u.permissao === permissaoFiltro
        );
      }

      setUsuarios(resultado);
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar usuários.'
      );

      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }, [busca, statusFiltro, permissaoFiltro, setErro]);

  useEffect(() => {
    const timer = setTimeout(carregar, busca ? 300 : 0);
    return () => clearTimeout(timer);
  }, [carregar, busca]);

  const excluirAlvo = excluirId
    ? usuarios.find((u) => u.id === excluirId)
    : null;

  async function confirmarExclusao() {
    if (!excluirId) return;

    try {
      await usuariosApi.deleteUsuario(excluirId);

      setExcluirId(null);
      setToast('Usuário excluído com sucesso.');

      await carregar();
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : 'Erro ao excluir usuário.'
      );

      setExcluirId(null);
    }
  }

  function limparFiltros() {
    setBusca('');
    setStatusFiltro('');
    setPermissaoFiltro('');
  }

  return (
    <PageShell
      title="Usuários do Sistema"
      subtitle="Controle de acesso e permissões"
    >
      <FeedbackAlert
        message={erro}
        variant="danger"
      />

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="mb-0">
              Filtros
            </h5>

            <button
              className="btn btn-outline-secondary"
              onClick={limparFiltros}
            >
              Limpar
            </button>
          </div>

          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">
                Buscar
              </label>

              <input
                type="search"
                className="form-control"
                placeholder="Nome, login ou e-mail..."
                value={busca}
                onChange={(e) =>
                  setBusca(e.target.value)
                }
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">
                Permissão
              </label>

              <select
                className="form-select"
                value={permissaoFiltro}
                onChange={(e) =>
                  setPermissaoFiltro(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Todas as permissões
                </option>

                <option value="Administrador">
                  Administrador
                </option>

                <option value="Financeiro">
                  Financeiro
                </option>

                <option value="Veterinário">
                  Veterinário
                </option>

                <option value="Voluntário">
                  Voluntário
                </option>
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">
                Status
              </label>

              <select
                className="form-select"
                value={statusFiltro}
                onChange={(e) =>
                  setStatusFiltro(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Todos
                </option>

                <option value="Ativo">
                  Ativo
                </option>

                <option value="Inativo">
                  Inativo
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <FormUsuario
        usuarios={usuarios}
        setUsuarios={setUsuarios}
        editandoId={editandoId}
        setEditandoId={setEditandoId}
        onSuccess={(msg) => {
          setToast(msg);
          carregar();
        }}
        onError={setErro}
      />

      <div className="mt-4">
        {loading ? (
          <p className="text-muted">
            Carregando...
          </p>
        ) : (
          <ListaUsuarios
            usuarios={usuarios}
            onExcluir={setExcluirId}
            onEditar={setEditandoId}
          />
        )}
      </div>

      <ConfirmModal
        show={!!excluirId}
        nome={excluirAlvo?.nome}
        onConfirm={confirmarExclusao}
        onCancel={() => setExcluirId(null)}
      />

      <Toast
        message={toast}
        type="success"
      />
    </PageShell>
  );
}