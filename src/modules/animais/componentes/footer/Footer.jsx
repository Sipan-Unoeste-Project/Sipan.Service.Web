import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                
                <div className="footer-logo">
                    <img  
                        alt="Logo" 
                        className="footer-logo-img"
                    />
                </div>

                <div className="footer-social">
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                        <i className="fab fa-facebook-f"></i>
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                        <i className="fab fa-instagram"></i>
                    </a>
                    <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="social-icon">
                        <i className="fab fa-whatsapp"></i>
                    </a>
                </div>

            </div>
        </footer>
    );
};

export default Footer;