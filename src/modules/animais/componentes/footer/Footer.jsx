const Footer = () => {
  return (
    <footer className="bg-success text-white">
      <div className="container py-3 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <div className="d-flex align-items-center gap-2">
          <img alt="Logo" className="img-fluid" style={{ height: 45 }} />
          <span className="h6 mb-0">APAC</span>
        </div>

        <div className="d-flex gap-3">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white fs-5">
            <i className="fab fa-facebook-f"></i>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white fs-5">
            <i className="fab fa-instagram"></i>
          </a>
          <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="text-white fs-5">
            <i className="fab fa-whatsapp"></i>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
