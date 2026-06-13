USE sipan;

CREATE TABLE IF NOT EXISTS parceiro_tipos (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome        VARCHAR(100)    NOT NULL,
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_parceiro_tipos_nome (nome)
) ENGINE=InnoDB
  COMMENT='Tipos de parceiro/fornecedor cadastráveis pelo usuário';

CREATE TABLE IF NOT EXISTS parceiros (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome        VARCHAR(150)    NOT NULL,
  cpf_cnpj    VARCHAR(18)     NOT NULL COMMENT 'Formatado: ###.###.###-## ou ##.###.###/####-##',
  tipo_id     BIGINT UNSIGNED NULL      COMMENT 'FK para parceiro_tipos; NULL se tipo foi excluído',
  tipo_nome   VARCHAR(100)    NOT NULL  COMMENT 'Cópia desnormalizada para exibição mesmo se tipo for excluído',
  telefone    VARCHAR(20)     NOT NULL,
  email       VARCHAR(150)    NOT NULL,
  endereco    VARCHAR(255)    NOT NULL,
  status      ENUM('ativo', 'inativo') NOT NULL DEFAULT 'ativo',
  observacoes TEXT            NULL,
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_parceiros_cpf_cnpj (cpf_cnpj),
  KEY idx_parceiros_nome   (nome),
  KEY idx_parceiros_status (status),
  KEY idx_parceiros_tipo   (tipo_id),
  CONSTRAINT fk_parceiros_tipo
    FOREIGN KEY (tipo_id) REFERENCES parceiro_tipos (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB
  COMMENT='Parceiros e fornecedores da instituição';

INSERT INTO parceiro_tipos (nome) VALUES
  ('Clínica Veterinária'),
  ('Pet Shop'),
  ('Fornecedor de Ração'),
  ('Farmácia'),
  ('Outro')
ON DUPLICATE KEY UPDATE nome = VALUES(nome);
