import { useState, useEffect } from 'react';
import { ApiError } from '../../../api/client';
import * as usuariosApi from '../../../api/usuariosApi';

const SENHA_FORTE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

export default function FormUsuario({
  usuarios,
  setUsuarios,
  editandoId,
  setEditandoId,
  onSuccess,
  onError,
}) {
  const [nome, setNome] = useState('');
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [permissao, setPermissao] = useState('');
  const [status, setStatus] = useState('Ativo');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (editandoId == null) return;
    const usuario = usuarios.find((u) => u.id === editandoId);
    if (!usuario) return;
    setNome(usuario.nome);
    setLogin(usuario.login);
    setEmail(usuario.email);
    setSenha('');
    setPermissao(usuario.permissao);
    setStatus(usuario.status);
  }, [editandoId, usuarios]);

  function limparCampos() {
    setNome('');
    setLogin('');
    setEmail('');
    setSenha('');
    setPermissao('');
    setStatus('Ativo');
    setEditandoId(null);
  }

  async function cadastrarUsuario() {
    if (!nome || !login || !email || !permissao) {
      onError?.('Todos os campos são obrigatórios.');
      return;
    }

    if (editandoId == null && !senha) {
      onError?.('Senha é obrigatória para novo usuário.');
      return;
    }

    if (senha && !SENHA_FORTE.test(senha)) {
      onError?.(
        'A senha deve ter pelo menos 8 caracteres, letra maiúscula, minúscula, número e caractere especial.'
      );
      return;
    }

    const body = usuariosApi.toUsuarioBody({ nome, login, email, senha, permissao, status });

    setSalvando(true);
    try {
      if (editandoId != null) {
        const atualizado = await usuariosApi.updateUsuario(editandoId, body);
        setUsuarios(usuarios.map((u) => (u.id === editandoId ? atualizado : u)));
        onSuccess?.('Usuário editado com sucesso.');
      } else {
        const criado = await usuariosApi.createUsuario(body);
        setUsuarios([...usuarios, criado]);
        onSuccess?.('Usuário cadastrado com sucesso.');
      }
      limparCampos();
    } catch (err) {
      onError?.(err instanceof ApiError ? err.message : 'Erro ao salvar usuário.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body">
        <h4 className="mb-4">{editandoId != null ? 'Editar Usuário' : 'Cadastrar Usuário'}</h4>

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
            <label className="form-label">Login</label>
            <input
              type="text"
              className="form-control"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">E-mail</label>
            <input
              type="email"
              className="form-control"
              placeholder="usuario@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">
              {editandoId != null ? 'Nova senha (opcional)' : 'Senha'}
            </label>
            <input
              type="password"
              className="form-control"
              placeholder="Digite uma senha forte"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <small className="text-muted">
              Mínimo 8 caracteres: maiúscula, minúscula, número e caractere especial.
            </small>
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Permissão</label>
            <select
              className="form-select"
              value={permissao}
              onChange={(e) => setPermissao(e.target.value)}
            >
              <option value="">Selecione</option>
              <option>Administrador</option>
              <option>Funcionário</option>
              <option>Veterinário</option>
              <option>Voluntário</option>
            </select>
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
            onClick={cadastrarUsuario}
            disabled={salvando}
          >
            {salvando ? 'Salvando...' : editandoId != null ? 'Salvar Alterações' : 'Cadastrar'}
          </button>
        </div>
      </div>
    </div>
  );
}
