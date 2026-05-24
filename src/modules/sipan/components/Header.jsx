function Header({ busca, setBusca }) {
  return (
    <header className="bg-success text-white p-3 d-flex justify-content-between align-items-center">

      <h3 className="m-0">
        SIPAN
      </h3>

      <input
        type="text"
        className="form-control w-25"
        placeholder="Buscar..."
        value={busca}
        onChange={(e) =>
          setBusca(e.target.value)
        }
      />

    </header>
  )
}

export default Header