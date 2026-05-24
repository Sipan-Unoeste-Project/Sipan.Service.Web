import { useState, useEffect } from 'react';
import PageShell from '../../../components/PageShell';
import FormUsuario from '../components/FormUsuario';
import ListaUsuarios from '../components/ListaUsuarios';

function Usuarios() {
  const [usuarios, setUsuarios] = useState(() => {
    const dadosSalvos = localStorage.getItem('usuarios');
    return dadosSalvos ? JSON.parse(dadosSalvos) : [];
  });

  const [busca, setBusca] = useState('');
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
  }, [usuarios]);

  function excluirUsuario(index) {
    if (!window.confirm('Deseja excluir este usuário?')) return;
    setUsuarios(usuarios.filter((_, i) => i !== index));
  }

  function editarUsuario(index) {
    setEditando(index);
  }

  const usuariosFiltrados = usuarios.filter(
    (usuario) =>
      usuario.nome.toLowerCase().includes(busca.toLowerCase()) ||
      usuario.permissao.toLowerCase().includes(busca.toLowerCase())
  );

  const ativos = usuarios.filter((u) => u.status === 'Ativo').length;
  const admins = usuarios.filter((u) => u.permissao === 'Administrador').length;

  return (
    <PageShell
      title="Usuários do sistema"
      subtitle="Controle de acesso e permissões"
    >
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm text-center h-100">
            <div className="card-body py-3">
              <p className="text-muted small mb-1">Total</p>
              <p className="fs-3 fw-bold mb-0">{usuarios.length}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm text-center h-100">
            <div className="card-body py-3">
              <p className="text-muted small mb-1">Ativos</p>
              <p className="fs-3 fw-bold mb-0">{ativos}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm text-center h-100">
            <div className="card-body py-3">
              <p className="text-muted small mb-1">Administradores</p>
              <p className="fs-3 fw-bold mb-0">{admins}</p>
            </div>
          </div>
        </div>
      </div>

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
        editando={editando}
        setEditando={setEditando}
      />

      <div className="mt-4">
        <ListaUsuarios
          usuarios={usuariosFiltrados}
          excluirUsuario={excluirUsuario}
          editarUsuario={editarUsuario}
        />
      </div>
    </PageShell>
  );
}

export default Usuarios;
