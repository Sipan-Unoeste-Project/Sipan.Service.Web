export default function QuemSomos() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div className="flex-grow-1 d-flex align-items-center py-5">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <h1 className="display-5 fw-bold mb-4">Quem Somos</h1>
              
              <p className="lead mb-3">
                A APAC é uma organização dedicada ao bem-estar e proteção dos animais.
              </p>

              <p className="mb-3">
                Nossa missão é oferecer abrigo, cuidados veterinários e oportunidades de adoção 
                para animais necessitados. Trabalhamos com um time de voluntários apaixonados 
                e profissionais qualificados para garantir que cada animal receba o melhor 
                atendimento possível.
              </p>

              <p className="mb-4">
                Desde nossa fundação, ajudamos milhares de animais a encontrar lares amorosos 
                e seguros. Acreditamos que todo animal merece uma chance de viver feliz e 
                saudável.
              </p>

              <div className="d-flex gap-2">
                <a href="/publico/animais" className="btn btn-outline-success btn-lg">
                  Ver Animais
                </a>
                <a href="/publico/doacoes" className="btn btn-outline-success btn-lg">
                  Fazer Doação
                </a>
              </div>
            </div>

            <div className="col-lg-6 text-center">
              <img 
                src="/logo-apac.png" 
                alt="Logo APAC" 
                className="img-fluid"
                style={{ maxWidth: 500 }}
              />
            </div>
          </div>
        </div>
      </div>

      <footer style={{ backgroundColor: '#16744a', color: 'white' }} className="py-4 mt-auto">
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
              <a href="#" style={{ color: 'white', fontSize: '1.5rem' }} title="Facebook">
                📘
              </a>
              <a href="#" style={{ color: 'white', fontSize: '1.5rem' }} title="Instagram">
                📷
              </a>
              <a href="#" style={{ color: 'white', fontSize: '1.5rem' }} title="WhatsApp">
                💬
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
