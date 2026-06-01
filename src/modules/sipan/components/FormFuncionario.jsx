import { useState, useEffect } from 'react';
import { ApiError } from '../../../api/client';
import * as funcionariosApi from '../../../api/funcionariosApi';
import { maskCPF, maskPhone } from '../../../utils/masks';

export default function FormFuncionario({
  funcionarios,
  setFuncionarios,
  editandoId,
  setEditandoId,
  onSuccess,
  onError,
}) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [cargo, setCargo] = useState('');
  const [telefone, setTelefone] = useState('');
  const [status, setStatus] = useState('Ativo');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (editandoId == null) return;
    const funcionario = funcionarios.find((f) => f.id === editandoId);
    if (!funcionario) return;
    setNome(funcionario.nome);
    setCpf(funcionario.cpf);
    setCargo(funcionario.cargo);
    setTelefone(funcionario.telefone);
    setStatus(funcionario.status);
  }, [editandoId, funcionarios]);

  function limparCampos() {
    setNome('');
    setCpf('');
    setCargo('');
    setTelefone('');
    setStatus('Ativo');
    setEditandoId(null);
  }

  async function cadastrarFuncionario() {
    if (!nome || !cpf || !cargo || !telefone) {
      onError?.('Todos os campos são obrigatórios.');
      return;
    }

    const body = { nome, cpf, cargo, telefone, status };

    setSalvando(true);
    try {
      if (editandoId != null) {
        const atualizado = await funcionariosApi.updateFuncionario(editandoId, body);
        setFuncionarios(funcionarios.map((f) => (f.id === editandoId ? atualizado : f)));
        onSuccess?.('Funcionário editado com sucesso.');
      } else {
        const criado = await funcionariosApi.createFuncionario(body);
        setFuncionarios([...funcionarios, criado]);
        onSuccess?.('Funcionário cadastrado com sucesso.');
      }
      limparCampos();
    } catch (err) {
      onError?.(err instanceof ApiError ? err.message : 'Erro ao salvar funcionário.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body">
        <h4 className="mb-4">
          {editandoId != null ? 'Editar Funcionário' : 'Cadastrar Funcionário'}
        </h4>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Nome</label>
            <input
              type="text"
              className="form-control"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">CPF</label>
            <input
              type="text"
              className="form-control"
              placeholder="000.000.000-00"
              maxLength={14}
              value={cpf}
              onChange={(e) => setCpf(maskCPF(e.target.value))}
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Cargo</label>
            <select
              className="form-select"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
            >
              <option value="">Selecione</option>
              <option>Veterinário</option>
              <option>Administrador</option>
              <option>Recepcionista</option>
              <option>Auxiliar</option>
              <option>Voluntário</option>
            </select>
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Telefone</label>
            <input
              type="text"
              className="form-control"
              placeholder="(00) 00000-0000"
              maxLength={15}
              value={telefone}
              onChange={(e) => setTelefone(maskPhone(e.target.value))}
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option>Ativo</option>
              <option>Inativo</option>
            </select>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button type="button" className="btn btn-secondary" onClick={limparCampos} disabled={salvando}>
            Limpar
          </button>
          <button
            type="button"
            className="btn btn-success"
            onClick={cadastrarFuncionario}
            disabled={salvando}
          >
            {salvando ? 'Salvando...' : editandoId != null ? 'Salvar Alterações' : 'Cadastrar'}
          </button>
        </div>
      </div>
    </div>
  );
}
