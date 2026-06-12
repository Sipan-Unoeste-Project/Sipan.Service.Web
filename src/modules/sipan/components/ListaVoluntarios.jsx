import { useMemo, useState } from 'react';

export default function ListaVoluntarios({
  funcionarios,
  onExcluir,
  onEditar,
}) {
  const [ordenacao, setOrdenacao] = useState({ campo: 'nome', direcao: 'asc' });

  function ordenarPor(campo) {
    setOrdenacao((anterior) => ({
      campo,
      direcao: anterior.campo === campo && anterior.direcao === 'asc' ? 'desc' : 'asc',
    }));
  }

  const voluntariosOrdenados = useMemo(() => {
    const lista = [...funcionarios];
    lista.sort((a, b) => {
      const valorA = String(a[ordenacao.campo] ?? '').toLowerCase();
      const valorB = String(b[ordenacao.campo] ?? '').toLowerCase();
      if (valorA < valorB) return ordenacao.direcao === 'asc' ? -1 : 1;
      if (valorA > valorB) return ordenacao.direcao === 'asc' ? 1 : -1;
      return 0;
    });
    return lista;
  }, [funcionarios, ordenacao]);

  const icone = (campo) => {
    if (ordenacao.campo !== campo) return '↕';
    return ordenacao.direcao === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <h4 className="mb-4">Lista de Voluntários</h4>

        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead className="table-success">
              <tr>
                <th style={{ cursor: 'pointer' }} onClick={() => ordenarPor('nome')}>
                  Nome {icone('nome')}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => ordenarPor('cpf')}>
                  CPF {icone('cpf')}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => ordenarPor('cargo')}>
                  Função {icone('cargo')}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => ordenarPor('telefone')}>
                  Telefone {icone('telefone')}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => ordenarPor('status')}>
                  Status {icone('status')}
                </th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {voluntariosOrdenados.length > 0 ? (
                voluntariosOrdenados.map((funcionario) => (
                  <tr key={funcionario.id}>
                    <td>{funcionario.nome}</td>
                    <td>{funcionario.cpf}</td>
                    <td>
                      <span className="badge bg-primary">{funcionario.cargo}</span>
                    </td>
                    <td>{funcionario.telefone}</td>
                    <td>
                      <span className={funcionario.status === 'Ativo' ? 'badge bg-success' : 'badge bg-danger'}>
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
                    Nenhum voluntário cadastrado
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