import { NavLink } from 'react-router-dom'

function Sidebar() {
  const btnClass = ({ isActive }) =>
    `btn ${isActive ? 'btn-success' : 'btn-outline-success'}`

  return (
    <aside className="col-md-2 bg-light vh-100 p-3 border-end">

      <nav className="d-flex flex-column gap-2">

        <NavLink
          to="/usuarios"
          className={btnClass}
        >
          Usuários
        </NavLink>

        <NavLink
          to="/funcionarios"
          className={btnClass}
        >
          Funcionários
        </NavLink>

      </nav>

    </aside>
  )
}

export default Sidebar