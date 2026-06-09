export default function Contato() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div className="flex-grow-1 d-flex align-items-center py-5">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <h1 className="display-5 fw-bold mb-4">Contato</h1>
              <p className="lead mb-3">
                Entre em contato conosco para saber mais sobre adoção, doações e como ajudar.
              </p>

              <div className="mb-4">
                <p className="mb-2"><strong>Telefone:</strong> (00) 0000-0000</p>
                <p className="mb-2"><strong>E-mail:</strong> contato@apac.org.br</p>
                <p className="mb-0"><strong>Endereço:</strong> Rua Exemplo, 123, Bairro, Cidade</p>
              </div>

              <div className="d-flex gap-2 flex-wrap">
                <a href="mailto:contato@apac.org.br" className="btn btn-lg" style={{ backgroundColor: '#16744a', color: 'white' }}>
                  Enviar E-mail
                </a>
                <a href="tel:+550000000000" className="btn btn-outline-success btn-lg" style={{ borderColor: '#16744a', color: '#16744a' }}>
                  Ligar
                </a>
              </div>
            </div>

            <div className="col-lg-6 text-center">
              <img 
                src="/logo-apac.png" 
                alt="Logo APAC" 
                className="img-fluid"
                style={{ maxWidth: 300 }}
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
