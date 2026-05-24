import { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            console.log('Buscando por:', searchTerm);
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                
                <div className="navbar-logo">
                    <img 
                        alt="Logo" 
                        className="logo-img"
                    />
                </div>
                <form className="search-form" onSubmit={handleSearch}>
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Buscar"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <button type="submit" className="search-btn">
                            🔍
                        </button>
                    </div>
                </form>

                <div className="navbar-user">
                    <button className="user-btn">
                        👤
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;