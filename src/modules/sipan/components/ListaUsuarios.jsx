function ListaUsuarios({
  usuarios,
  excluirUsuario,
  editarUsuario
}) {

  return (
    <div className="card border-0 shadow-sm">

      <div className="card-body">

        <h4 className="mb-4">
          Lista de Usuários
        </h4>

        <div className="table-responsive">

          <table className="table table-striped table-hover align-middle">

            <thead className="table-success">

              <tr>

                <th>Nome</th>
                <th>Login</th>
                <th>Permissão</th>
                <th>Status</th>
                <th>Ações</th>

              </tr>

            </thead>

            <tbody>

              {
                usuarios.length > 0 ? (

                  usuarios.map(
                    (usuario, index) => (

                      <tr key={index}>

                        <td>{usuario.nome}</td>

                        <td>{usuario.login}</td>

                        <td>{usuario.permissao}</td>

                        <td>

                          <span
                            className={
                              usuario.status === 'Ativo'
                                ? 'badge bg-success'
                                : 'badge bg-danger'
                            }
                          >

                            {usuario.status}

                          </span>

                        </td>

                        <td>

                          <button
                            className="btn btn-warning btn-sm me-2"
                            onClick={() =>
                              editarUsuario(index)
                            }
                          >
                            Editar
                          </button>

                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() =>
                              excluirUsuario(index)
                            }
                          >
                            Excluir
                          </button>

                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="5"
                      className="text-center"
                    >
                      Nenhum usuário cadastrado
                    </td>

                  </tr>

                )
              }

            </tbody>

          </table>

        </div>

      </div>

    </div>
  )
}

export default ListaUsuarios