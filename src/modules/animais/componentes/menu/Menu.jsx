import { Link, useLocation } from 'react-router-dom';
import './Menu.css';

const Menu = () => {
    const location = useLocation();

    const menuItems = [
        // { path: '/quem-somos', label: 'Quem Somos' },
        { path: '/animais', label: 'Animais' },
        // { path: '/doacoes', label: 'Doações' },
        // { path: '/estoque', label: 'Estoque' },
        // { path: '/financeiro', label: 'Financeiro' },
        // { path: '/campanhas', label: 'Campanhas' },
        // { path: '/contato', label: 'Contato' },
    ];

    return (
        <div className="sidebar">
            <nav className="sidebar-nav">
                <ul>
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
                            >
                                <span className="menu-icon">{item.icon}</span>
                                <span className="menu-label">{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-exit">
                <button className="botao-sair" onClick={() => alert('Saindo do sistema...')}>
                    Sair
                </button>
            </div>
        </div>
    );
};

export default Menu;