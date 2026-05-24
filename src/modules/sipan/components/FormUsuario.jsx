import { useState, useEffect } from 'react'

function FormUsuario({
  usuarios,
  setUsuarios,
  editando,
  setEditando
}) {

  const [nome, setNome] = useState('')
  const [login, setLogin] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [permissao, setPermissao] = useState('')
  const [status, setStatus] = useState('Ativo')

  const [erro, setErro] = useState('')

  useEffect(() => {

    if (editando !== null) {

      const usuario = usuarios[editando]

      setNome(usuario.nome)
      setLogin(usuario.login)
      setEmail(usuario.email)
      setSenha(usuario.senha)
      setPermissao(usuario.permissao)
      setStatus(usuario.status)

    }

  }, [editando, usuarios])

  function limparCampos() {

    setNome('')
    setLogin('')
    setEmail('')
    setSenha('')
    setPermissao('')
    setStatus('Ativo')
    setErro('')
    setEditando(null)

  }

  function cadastrarUsuario() {

    if (
      nome === '' ||
      login === '' ||
      email === '' ||
      senha === '' ||
      permissao === ''
    ) {

      setErro('Todos os campos são obrigatórios!')
      return

    }

    setErro('')
    
    const senhaForte =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/

if (!senhaForte.test(senha)) {

  setErro(
    'A senha deve ter pelo menos 8 caracteres, letra maiúscula, minúscula, número e caractere especial.'
  )

  return

}

    const novoUsuario = {
      nome,
      login,
      email,
      senha,
      permissao,
      status
    }

    if (editando !== null) {

      const listaAtualizada = [...usuarios]

      listaAtualizada[editando] = novoUsuario

      setUsuarios(listaAtualizada)

      alert('Usuário editado com sucesso!')

    } else {

      setUsuarios([
        ...usuarios,
        novoUsuario
      ])

      alert('Usuário cadastrado com sucesso!')

    }

    limparCampos()

  }

  return (
    <div className="card shadow mb-4">

      <div className="card-body">

        <h4 className="mb-4">

          {
            editando !== null
              ? 'Editar Usuário'
              : 'Cadastrar Usuário'
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
              Login
            </label>

            <input
              type="text"
              className="form-control"
              value={login}
              onChange={(e) =>
                setLogin(e.target.value)
              }
            />

          </div>

          <div className="col-md-6 mb-3">

            <label className="form-label">
              Email
            </label>

            <input
              type="email"
              className="form-control"
              placeholder="usuario@email.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

          </div>

          <div className="col-md-6 mb-3">

            <label className="form-label">
              Senha
            </label>

            <input
              type="password"
              className="form-control"
              placeholder="Digite uma senha forte"
              value={senha}
              onChange={(e) =>
                setSenha(e.target.value)
              }
            />

            <small className="text-muted">

              A senha deve conter:
              letra maiúscula,
              letra minúscula,
              número e caractere especial.

            </small>

          </div>

          <div className="col-md-6 mb-3">

            <label className="form-label">
              Permissão
            </label>

            <select
              className="form-select"
              value={permissao}
              onChange={(e) =>
                setPermissao(e.target.value)
              }
            >

              <option value="">
                Selecione
              </option>

              <option>
                Administrador
              </option>

              <option>
                Funcionário
              </option>

              <option>
                Veterinário
              </option>

              <option>
                Voluntário
              </option>

            </select>

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
            onClick={cadastrarUsuario}
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

export default FormUsuario