import { useState, useEffect, useCallback } from 'react';
import { ApiError } from '../../../api/client';
import * as usuariosApi from '../../../api/usuariosApi';
import PageShell from '../../../components/PageShell';
import SimpleStatsRow from '../../../components/SimpleStatsRow';
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
  const [editandoId, setEditandoId] = useState(null);
  const [excluirId, setExcluirId] = useState(null);
  const [erro, setErro] = useTimedMessage(6000);
  const [toast, setToast] = useTimedMessage(3500);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const lista = await usuariosApi.listUsuarios({ busca: busca || undefined });
      setUsuarios(lista);
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar usuários. Verifique se a API está em execução.'
      );
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }, [busca, setErro]);

  useEffect(() => {
    const timer = setTimeout(carregar, busca ? 300 : 0);
    return () => clearTimeout(timer);
  }, [carregar, busca]);

  const excluirAlvo = excluirId ? usuarios.find((u) => u.id === excluirId) : null;

  async function confirmarExclusao() {
    if (!excluirId) return;
    try {
      await usuariosApi.deleteUsuario(excluirId);
      setExcluirId(null);
      setToast('Usuário excluído com sucesso.');
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao excluir usuário.');
      setExcluirId(null);
    }
  }

  const ativos = usuarios.filter((u) => u.status === 'Ativo').length;
  const admins = usuarios.filter((u) => u.permissao === 'Administrador').length;

  return (
    <PageShell
      title="Usuários do sistema"
      subtitle="Controle de acesso e permissões"
    >
      <SimpleStatsRow
        items={[
          { label: 'Total', value: loading ? '—' : usuarios.length },
          { label: 'Ativos', value: ativos },
          { label: 'Administradores', value: admins },
        ]}
      />

      <FeedbackAlert message={erro} variant="danger" />

      <div className="mb-4">
        <input
          type="search"
          className="form-control"
          style={{ maxWidth: 320 }}
          placeholder="Buscar por nome ou permissão..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
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
          <p className="text-muted">Carregando...</p>
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

      <Toast message={toast} type="success" />
    </PageShell>
  );
}
