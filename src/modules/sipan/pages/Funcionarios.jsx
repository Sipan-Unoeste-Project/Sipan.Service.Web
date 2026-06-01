import { useState, useEffect, useCallback } from 'react';
import { ApiError } from '../../../api/client';
import * as funcionariosApi from '../../../api/funcionariosApi';
import PageShell from '../../../components/PageShell';
import SimpleStatsRow from '../../../components/SimpleStatsRow';
import ConfirmModal from '../../../components/ConfirmModal';
import FeedbackAlert from '../../../components/FeedbackAlert';
import Toast from '../../../components/Toast';
import { useTimedMessage } from '../../../hooks/useTimedMessage';
import FormFuncionario from '../components/FormFuncionario';
import ListaFuncionarios from '../components/ListaFuncionarios';

export default function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [excluirId, setExcluirId] = useState(null);
  const [erro, setErro] = useTimedMessage(6000);
  const [toast, setToast] = useTimedMessage(3500);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const lista = await funcionariosApi.listFuncionarios({ busca: busca || undefined });
      setFuncionarios(lista);
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar funcionários. Verifique se a API está em execução.'
      );
      setFuncionarios([]);
    } finally {
      setLoading(false);
    }
  }, [busca, setErro]);

  useEffect(() => {
    const timer = setTimeout(carregar, busca ? 300 : 0);
    return () => clearTimeout(timer);
  }, [carregar, busca]);

  const excluirAlvo = excluirId ? funcionarios.find((f) => f.id === excluirId) : null;

  async function confirmarExclusao() {
    if (!excluirId) return;
    try {
      await funcionariosApi.deleteFuncionario(excluirId);
      setExcluirId(null);
      setToast('Funcionário excluído com sucesso.');
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao excluir funcionário.');
      setExcluirId(null);
    }
  }

  const ativos = funcionarios.filter((f) => f.status === 'Ativo').length;
  const veterinarios = funcionarios.filter((f) => f.cargo === 'Veterinário').length;

  return (
    <PageShell title="Funcionários" subtitle="Equipe e cargos do abrigo">
      <SimpleStatsRow
        items={[
          { label: 'Total', value: loading ? '—' : funcionarios.length },
          { label: 'Ativos', value: ativos },
          { label: 'Veterinários', value: veterinarios },
        ]}
      />

      <FeedbackAlert message={erro} variant="danger" />

      <div className="mb-4">
        <input
          type="search"
          className="form-control"
          style={{ maxWidth: 320 }}
          placeholder="Buscar por nome ou cargo..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <FormFuncionario
        funcionarios={funcionarios}
        setFuncionarios={setFuncionarios}
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
          <ListaFuncionarios
            funcionarios={funcionarios}
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
