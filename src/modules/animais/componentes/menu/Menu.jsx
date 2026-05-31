import { Link, useLocation } from "react-router-dom";

const Menu = () => {
  const location = useLocation();

  const menuItems = [
    { path: "/animais", label: "Animais" },
  ];

  return (
    <div className="d-flex flex-column vh-100 bg-light border-end">
      <nav className="nav flex-column p-3 gap-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link rounded ${location.pathname === item.path ? "bg-success text-white fw-semibold" : "text-dark"}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto p-3">
        <button className="btn btn-outline-secondary w-100" onClick={() => alert("Saindo do sistema...")}>Sair</button>
      </div>
    </div>
  );
};

export default Menu;
