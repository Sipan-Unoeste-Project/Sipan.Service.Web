import { useMemo, useState } from 'react';

export default function ListaUsuarios({
  usuarios,
  onExcluir,
  onEditar,
}) {
  const [ordenacao, setOrdenacao] =
    useState('nome');

  const [direcao, setDirecao] =
    useState('asc');

  function ordenar(campo) {
    if (campo === ordenacao) {
      setDirecao(
        direcao === 'asc'
          ? 'desc'
          : 'asc'
      );
      return;
    }

    setOrdenacao(campo);
    setDirecao('asc');
  }

  const usuariosOrdenados = useMemo(() => {
    return [...usuarios].sort((a, b) => {
      const valorA =
        a[ordenacao]?.toString().toLowerCase() ??
        '';

      const valorB =
        b[ordenacao]?.toString().toLowerCase() ??
        '';

      const resultado =
        valorA.localeCompare(valorB);

      return direcao === 'asc'
        ? resultado
        : -resultado;
    });
  }, [usuarios, ordenacao, direcao]);

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
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    ordenar('nome')
                  }
                >
                  Nome ↕
                </th>

                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    ordenar('login')
                  }
                >
                  Login ↕
                </th>

                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    ordenar('permissao')
                  }
                >
                  Permissão ↕
                </th>

                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    ordenar('status')
                  }
                >
                  Status ↕
                </th>

                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {usuariosOrdenados.length > 0 ? (
                usuariosOrdenados.map(
                  (usuario) => (
                    <tr key={usuario.id}>
                      <td>{usuario.nome}</td>

                      <td>{usuario.login}</td>

                      <td>
                        {usuario.permissao}
                      </td>

                      <td>
                        <span
                          className={
                            usuario.status ===
                            'Ativo'
                              ? 'badge bg-success'
                              : 'badge bg-danger'
                          }
                        >
                          {usuario.status}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="btn btn-warning btn-sm me-2"
                          onClick={() =>
                            onEditar(
                              usuario.id
                            )
                          }
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() =>
                            onExcluir(
                              usuario.id
                            )
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
                    colSpan={5}
                    className="text-center"
                  >
                    Nenhum usuário cadastrado
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