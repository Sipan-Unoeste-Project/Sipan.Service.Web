export default function ListaFuncionarios({ funcionarios, onExcluir, onEditar }) {
  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <h4 className="mb-4">Lista de Funcionários</h4>

        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead className="table-success">
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Cargo</th>
                <th>Telefone</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {funcionarios.length > 0 ? (
                funcionarios.map((funcionario) => (
                  <tr key={funcionario.id}>
                    <td>{funcionario.nome}</td>
                    <td>{funcionario.cpf}</td>
                    <td>{funcionario.cargo}</td>
                    <td>{funcionario.telefone}</td>
                    <td>
                      <span
                        className={
                          funcionario.status === 'Ativo'
                            ? 'badge bg-success'
                            : 'badge bg-danger'
                        }
                      >
                        {funcionario.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => onEditar(funcionario.id)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => onExcluir(funcionario.id)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center">
                    Nenhum funcionário cadastrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
