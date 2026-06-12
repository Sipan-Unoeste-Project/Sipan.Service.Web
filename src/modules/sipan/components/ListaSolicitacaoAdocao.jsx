import { useMemo, useState } from 'react';

const STATUS_ADOCAO = ['Pendente', 'Em análise', 'Aprovada', 'Recusada', 'Concluída'];

const ANIMAIS_MOCK = [
  { id: 1, nome: 'Rex', especie: 'Cachorro' },
  { id: 2, nome: 'Mimi', especie: 'Gato' },
  { id: 3, nome: 'Bolinha', especie: 'Cachorro' },
];

function badgeStatus(status) {
  const map = {
    'Pendente': 'bg-warning text-dark',
    'Em análise': 'bg-info text-dark',
    'Aprovada': 'bg-success',
    'Recusada': 'bg-danger',
    'Concluída': 'bg-secondary',
  };
  return map[status] || 'bg-secondary';
}

export default function ListaSolicitacoes({
  solicitacoes,
  setSolicitacoes,
  onExcluir,
  onEditar,
  onToast,
}) {
  const [ordenacao, setOrdenacao] = useState({ campo: 'nomeAdotante', direcao: 'asc' });

  function ordenarPor(campo) {
    setOrdenacao((anterior) => ({
      campo,
      direcao: anterior.campo === campo && anterior.direcao === 'asc' ? 'desc' : 'asc',
    }));
  }

  const listaOrdenada = useMemo(() => {
    const lista = [...solicitacoes];
    lista.sort((a, b) => {
      const valorA = String(a[ordenacao.campo] ?? '').toLowerCase();
      const valorB = String(b[ordenacao.campo] ?? '').toLowerCase();
      if (valorA < valorB) return ordenacao.direcao === 'asc' ? -1 : 1;
      if (valorA > valorB) return ordenacao.direcao === 'asc' ? 1 : -1;
      return 0;
    });
    return lista;
  }, [solicitacoes, ordenacao]);

  const icone = (campo) => {
    if (ordenacao.campo !== campo) return '↕';
    return ordenacao.direcao === 'asc' ? '↑' : '↓';
  };

  function alterarStatus(id, novoStatus) {
    setSolicitacoes(solicitacoes.map((s) =>
      s.id === id ? { ...s, status: novoStatus } : s
    ));
    onToast?.(`Status atualizado para "${novoStatus}".`);
  }

  const animalNome = (id) => {
    const a = ANIMAIS_MOCK.find((a) => a.id === Number(id));
    return a ? `${a.nome} (${a.especie})` : '-';
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <h4 className="mb-4">Lista de Solicitações</h4>

        {solicitacoes.length === 0 ? (
          <p className="text-muted text-center py-3">Nenhuma solicitação registrada.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover align-middle">
              <thead className="table-success">
                <tr>
                  <th style={{ cursor: 'pointer' }} onClick={() => ordenarPor('nomeAdotante')}>
                    Adotante {icone('nomeAdotante')}
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => ordenarPor('cpf')}>
                    CPF {icone('cpf')}
                  </th>
                  <th>Animal</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => ordenarPor('dataSolicitacao')}>
                    Data {icone('dataSolicitacao')}
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => ordenarPor('status')}>
                    Status {icone('status')}
                  </th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {listaOrdenada.map((s) => (
                  <tr key={s.id}>
                    <td>{s.nomeAdotante}</td>
                    <td>{s.cpf}</td>
                    <td>{animalNome(s.animalId)}</td>
                    <td>{new Date(s.dataSolicitacao).toLocaleDateString('pt-BR')}</td>
                    <td>
                      <span className={`badge ${badgeStatus(s.status)}`}>
                        {s.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-1 flex-wrap">
                        <select
                          className="form-select form-select-sm"
                          style={{ width: 'auto' }}
                          value={s.status}
                          onChange={(e) => alterarStatus(s.id, e.target.value)}
                        >
                          {STATUS_ADOCAO.map((st) => (
                            <option key={st}>{st}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="btn btn-warning btn-sm"
                          onClick={() => onEditar(s.id)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => onExcluir(s.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}