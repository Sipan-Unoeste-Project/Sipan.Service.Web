import { useState, useEffect } from 'react'

function FormFuncionario({
  funcionarios,
  setFuncionarios,
  editando,
  setEditando
}) {

  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [cargo, setCargo] = useState('')
  const [telefone, setTelefone] = useState('')
  const [status, setStatus] = useState('Ativo')

  const [erro, setErro] = useState('')

  useEffect(() => {

    if (editando !== null) {

      const funcionario = funcionarios[editando]

      setNome(funcionario.nome)
      setCpf(funcionario.cpf)
      setCargo(funcionario.cargo)
      setTelefone(funcionario.telefone)
      setStatus(funcionario.status)

    }

  }, [editando, funcionarios])

  function limparCampos() {

    setNome('')
    setCpf('')
    setCargo('')
    setTelefone('')
    setStatus('Ativo')
    setErro('')
    setEditando(null)

  }

  function formatarCPF(valor) {

    valor = valor.replace(/\D/g, '')

    valor = valor.replace(/(\d{3})(\d)/, '$1.$2')
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2')
    valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2')

    return valor

  }

  function formatarTelefone(valor) {

    valor = valor.replace(/\D/g, '')

    valor = valor.replace(
      /^(\d{2})(\d)/g,
      '($1) $2'
    )

    valor = valor.replace(
      /(\d)(\d{4})$/,
      '$1-$2'
    )

    return valor

  }

  function cadastrarFuncionario() {

    if (
      nome === '' ||
      cpf === '' ||
      cargo === '' ||
      telefone === ''
    ) {

      setErro('Todos os campos são obrigatórios!')
      return

    }

    setErro('')

    const novoFuncionario = {
      nome,
      cpf,
      cargo,
      telefone,
      status
    }

    if (editando !== null) {

      const listaAtualizada = [...funcionarios]

      listaAtualizada[editando] = novoFuncionario

      setFuncionarios(listaAtualizada)

      alert('Funcionário editado com sucesso!')

    } else {

      setFuncionarios([
        ...funcionarios,
        novoFuncionario
      ])

      alert('Funcionário cadastrado com sucesso!')

    }

    limparCampos()

  }

  return (
    <div className="card shadow mb-4">

      <div className="card-body">

        <h4 className="mb-4">

          {
            editando !== null
              ? 'Editar Funcionário'
              : 'Cadastrar Funcionário'
          }

        </h4>

        {
          erro && (
            <div className="alert alert-danger">
              {erro}
            </div>
          )
        }

        <div className="row">

          <div className="col-md-6 mb-3">

            <label className="form-label">
              Nome
            </label>

            <input
              type="text"
              className="form-control"
              value={nome}
              onChange={(e) =>
                setNome(e.target.value)
              }
            />

          </div>

          <div className="col-md-6 mb-3">

            <label className="form-label">
              CPF
            </label>

            <input
              type="text"
              className="form-control"
              placeholder="000.000.000-00"
              maxLength={14}
              value={cpf}
              onChange={(e) =>
                setCpf(
                  formatarCPF(
                    e.target.value
                  )
                )
              }
            />

          </div>

          <div className="col-md-6 mb-3">

            <label className="form-label">
              Cargo
            </label>

            <select
              className="form-select"
              value={cargo}
              onChange={(e) =>
                setCargo(e.target.value)
              }
            >

              <option value="">
                Selecione
              </option>

              <option>
                Veterinário
              </option>

              <option>
                Administrador
              </option>

              <option>
                Recepcionista
              </option>

              <option>
                Auxiliar
              </option>

              <option>
                Voluntário
              </option>

            </select>

          </div>

          <div className="col-md-6 mb-3">

            <label className="form-label">
              Telefone
            </label>

            <input
              type="text"
              className="form-control"
              placeholder="(00) 00000-0000"
              maxLength={15}
              value={telefone}
              onChange={(e) =>
                setTelefone(
                  formatarTelefone(
                    e.target.value
                  )
                )
              }
            />

          </div>

          <div className="col-md-6 mb-3">

            <label className="form-label">
              Status
            </label>

            <select
              className="form-select"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
            >

              <option>
                Ativo
              </option>

              <option>
                Inativo
              </option>

            </select>

          </div>

        </div>

        <div className="d-flex gap-2">

          <button
            className="btn btn-secondary"
            onClick={limparCampos}
          >
            Limpar
          </button>

          <button
            className="btn btn-success"
            onClick={cadastrarFuncionario}
          >

            {
              editando !== null
                ? 'Salvar Alterações'
                : 'Cadastrar'
            }

          </button>

        </div>

      </div>

    </div>
  )
}

export default FormFuncionario