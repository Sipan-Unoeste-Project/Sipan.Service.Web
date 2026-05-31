import { useState } from "react";

const Navbar = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      console.log("Buscando por:", searchTerm);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success sticky-top shadow-sm">
      <div className="container-fluid">
        <div className="d-flex align-items-center text-white">
          <img alt="Logo" className="rounded-circle me-2" style={{ height: 45, width: 45 }} />
          <span className="fw-semibold">APAC</span>
        </div>

        <form className="d-flex flex-grow-1 mx-3" onSubmit={handleSearch}>
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0"></span>
            <input
              type="text"
              placeholder="Buscar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control border-start-0"
            />
          </div>
        </form>

        <button className="btn btn-light btn-sm rounded-circle"></button>
      </div>
    </nav>
  );
};

export default Navbar;
