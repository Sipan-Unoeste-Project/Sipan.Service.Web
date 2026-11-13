export default function Footer() {
  return (
    <footer className="app-footer py-4">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-4 d-flex justify-content-center justify-content-md-start mb-3 mb-md-0">
            <img
              src="/logo-apac.png"
              alt="Logo APAC"
              style={{ height: 40 }}
            />
          </div>

          <div className="col-md-4 text-center">
            <p className="mb-0 small">
              © 2024 APAC - Associação de Proteção Animal. Todos os direitos reservados.
            </p>
          </div>

          <div className="col-md-4 d-flex justify-content-center justify-content-md-end gap-3">
            <a
              href="#"
              style={{ color: 'white', fontSize: '1.5rem', textDecoration: 'none', lineHeight: 1 }}
              title="Facebook"
              aria-label="Facebook"
            >
              <i className="bi bi-facebook" aria-hidden="true" />
            </a>
            <a
              href="#"
              style={{ color: 'white', fontSize: '1.5rem', textDecoration: 'none', lineHeight: 1 }}
              title="Instagram"
              aria-label="Instagram"
            >
              <i className="bi bi-instagram" aria-hidden="true" />
            </a>
            <a
              href="#"
              style={{ color: 'white', fontSize: '1.5rem', textDecoration: 'none', lineHeight: 1 }}
              title="WhatsApp"
              aria-label="WhatsApp"
            >
              <i className="bi bi-whatsapp" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
