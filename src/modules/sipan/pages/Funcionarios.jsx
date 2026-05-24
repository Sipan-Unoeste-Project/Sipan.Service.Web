import { useState, useEffect } from 'react';
import PageShell from '../../../components/PageShell';
import FormFuncionario from '../components/FormFuncionario';
import ListaFuncionarios from '../components/ListaFuncionarios';

function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState(() => {
    const dadosSalvos = localStorage.getItem('funcionarios');
    return dadosSalvos ? JSON.parse(dadosSalvos) : [];
  });

  const [busca, setBusca] = useState('');
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
  }, [funcionarios]);

  function excluirFuncionario(index) {
    if (!window.confirm('Deseja excluir este funcionário?')) return;
    setFuncionarios(funcionarios.filter((_, i) => i !== index));
  }

  function editarFuncionario(index) {
    setEditando(index);
  }

  const funcionariosFiltrados = funcionarios.filter(
    (funcionario) =>
      funcionario.nome.toLowerCase().includes(busca.toLowerCase()) ||
      funcionario.cargo.toLowerCase().includes(busca.toLowerCase())
  );

  const ativos = funcionarios.filter((f) => f.status === 'Ativo').length;
  const veterinarios = funcionarios.filter((f) => f.cargo === 'Veterinário').length;

  return (
    <PageShell title="Funcionários" subtitle="Equipe e cargos do abrigo">
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm text-center h-100">
            <div className="card-body py-3">
              <p className="text-muted small mb-1">Total</p>
              <p className="fs-3 fw-bold mb-0">{funcionarios.length}</p>
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
              <p className="text-muted small mb-1">Veterinários</p>
              <p className="fs-3 fw-bold mb-0">{veterinarios}</p>
            </div>
          </div>
        </div>
      </div>

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
        editando={editando}
        setEditando={setEditando}
      />

      <div className="mt-4">
        <ListaFuncionarios
          funcionarios={funcionariosFiltrados}
          excluirFuncionario={excluirFuncionario}
          editarFuncionario={editarFuncionario}
        />
      </div>
    </PageShell>
  );
}

export default Funcionarios;
