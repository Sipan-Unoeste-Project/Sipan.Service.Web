
CREATE DATABASE IF NOT EXISTS sipan
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sipan;

-- Pessoas: doadores, adotantes e voluntários
-- Tela: /pessoas
CREATE TABLE pessoas (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome         VARCHAR(150)    NOT NULL,
  cpf          VARCHAR(14)     NOT NULL,
  tipo         ENUM('doador', 'adotante', 'voluntario') NOT NULL,
  telefone     VARCHAR(20)     NOT NULL,
  email        VARCHAR(150)    NULL,
  observacoes  TEXT            NULL,
  criado_em    DATE            NOT NULL,
  created_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_pessoas_cpf (cpf),
  KEY idx_pessoas_tipo (tipo),
  KEY idx_pessoas_nome (nome)
) ENGINE=InnoDB
  COMMENT='Cadastro de pessoas (doador, adotante, voluntário)';

-- Animais do abrigo
-- Tela: /animais
CREATE TABLE animais (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome              VARCHAR(120)    NOT NULL,
  especie           VARCHAR(80)     NOT NULL,
  raca              VARCHAR(80)     NULL,
  sexo              ENUM('Macho', 'Fêmea', 'Desconhecido') NOT NULL DEFAULT 'Desconhecido',
  data_nascimento   DATE            NULL,
  data_acolhimento  DATE            NULL,
  porte             ENUM('Pequeno', 'Médio', 'Grande') NOT NULL DEFAULT 'Médio',
  castrado          TINYINT(1)      NOT NULL DEFAULT 0,
  vacinas           VARCHAR(500)    NULL,
  sobre             TEXT            NULL,
  foto              MEDIUMTEXT      NULL COMMENT 'URL do arquivo ou base64 temporário',
  status            ENUM('Disponível', 'Adotado', 'Em Tratamento', 'Indisponível') NOT NULL DEFAULT 'Disponível',
  data_cadastro     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_animais_nome (nome),
  KEY idx_animais_status (status),
  KEY idx_animais_especie (especie)
) ENGINE=InnoDB
  COMMENT='Animais cadastrados no abrigo';

-- Usuários com acesso ao sistema (login)
-- Tela: /usuarios
CREATE TABLE usuarios (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome        VARCHAR(150)    NOT NULL,
  login       VARCHAR(60)     NOT NULL,
  email       VARCHAR(150)    NOT NULL,
  senha_hash  VARCHAR(255)    NOT NULL COMMENT 'Hash bcrypt/argon2 – nunca texto puro',
  permissao   ENUM('Administrador', 'Funcionário', 'Veterinário', 'Voluntário') NOT NULL,
  status      ENUM('Ativo', 'Inativo') NOT NULL DEFAULT 'Ativo',
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_usuarios_login (login),
  UNIQUE KEY uk_usuarios_email (email),
  KEY idx_usuarios_status (status)
) ENGINE=InnoDB
  COMMENT='Contas de acesso ao sistema';

-- Funcionários da equipe do abrigo
-- Tela: /funcionarios
CREATE TABLE funcionarios (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome        VARCHAR(150)    NOT NULL,
  cpf         VARCHAR(14)     NOT NULL,
  cargo       ENUM('Veterinário', 'Administrador', 'Recepcionista', 'Auxiliar', 'Voluntário') NOT NULL,
  telefone    VARCHAR(20)     NOT NULL,
  status      ENUM('Ativo', 'Inativo') NOT NULL DEFAULT 'Ativo',
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_funcionarios_cpf (cpf),
  KEY idx_funcionarios_cargo (cargo),
  KEY idx_funcionarios_status (status)
) ENGINE=InnoDB
  COMMENT='Equipe e cargos do abrigo';

-- =============================================================================
-- APAC – CAMPANHAS E DOAÇÕES
-- =============================================================================

-- Tela: /apac/campanhas
CREATE TABLE apac_campanhas (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome         VARCHAR(200)    NOT NULL,
  descricao    TEXT            NULL,
  data_evento  DATE            NOT NULL,
  meta         DECIMAL(12, 2)  NOT NULL DEFAULT 0.00,
  arrecadado   DECIMAL(12, 2)  NOT NULL DEFAULT 0.00,
  status       ENUM('planejada', 'ativa', 'concluida', 'cancelada') NOT NULL DEFAULT 'planejada',
  created_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_campanhas_status (status),
  KEY idx_campanhas_data (data_evento)
) ENGINE=InnoDB
  COMMENT='Campanhas de arrecadação e eventos';

-- Tela: /apac/doacao
CREATE TABLE apac_doacoes (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  tipo              ENUM('dinheiro', 'produto') NOT NULL,
  nome              VARCHAR(150)    NULL,
  telefone          VARCHAR(20)     NULL,
  email             VARCHAR(150)    NULL,
  valor             DECIMAL(12, 2)  NULL COMMENT 'Preenchido quando tipo = dinheiro',
  forma_pagamento   VARCHAR(40)     NULL COMMENT 'PIX, Transferência, Dinheiro...',
  campanha_id       BIGINT UNSIGNED NULL,
  mensagem          TEXT            NULL,
  anonimo           TINYINT(1)      NOT NULL DEFAULT 0,
  data_doacao       DATE            NOT NULL,
  created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_doacoes_tipo (tipo),
  KEY idx_doacoes_data (data_doacao),
  KEY idx_doacoes_campanha (campanha_id),
  CONSTRAINT fk_doacoes_campanha
    FOREIGN KEY (campanha_id) REFERENCES apac_campanhas (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB
  COMMENT='Doações em dinheiro ou produtos';

CREATE TABLE apac_doacao_itens (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  doacao_id   BIGINT UNSIGNED NOT NULL,
  produto     VARCHAR(150)    NOT NULL,
  quantidade  VARCHAR(30)     NOT NULL,
  unidade     VARCHAR(40)     NOT NULL,
  PRIMARY KEY (id),
  KEY idx_doacao_itens_doacao (doacao_id),
  CONSTRAINT fk_doacao_itens_doacao
    FOREIGN KEY (doacao_id) REFERENCES apac_doacoes (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  COMMENT='Itens de doação quando tipo = produto';

-- =============================================================================
-- APAC – ESTOQUE
-- =============================================================================

-- Tela: /apac/estoque
CREATE TABLE apac_estoque (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  item        VARCHAR(200)    NOT NULL,
  categoria   ENUM('alimentos', 'medicamentos', 'limpeza', 'acessorios') NOT NULL,
  quantidade  INT UNSIGNED    NOT NULL DEFAULT 0,
  unidade     ENUM('unidades', 'kg', 'litros', 'pacotes') NOT NULL DEFAULT 'unidades',
  validade    DATE            NULL,
  local       VARCHAR(120)    NULL,
  limite_baixo_estoque INT UNSIGNED NOT NULL DEFAULT 5,
  status      ENUM('normal', 'baixo') NOT NULL DEFAULT 'normal',
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_estoque_categoria (categoria),
  KEY idx_estoque_validade (validade),
  KEY idx_estoque_status (status)
) ENGINE=InnoDB
  COMMENT='Itens de estoque do abrigo';

-- =============================================================================
-- APAC – FINANCEIRO
-- =============================================================================

-- Tela: /apac/financeiro (aba entradas)
CREATE TABLE apac_financeiro_entradas (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  origem          VARCHAR(100)    NOT NULL,
  valor           DECIMAL(12, 2)  NOT NULL,
  data_lancamento DATE            NOT NULL,
  responsavel     VARCHAR(150)    NULL,
  campanha_id     BIGINT UNSIGNED NULL,
  observacoes     TEXT            NULL,
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_fin_entradas_data (data_lancamento),
  KEY idx_fin_entradas_campanha (campanha_id),
  CONSTRAINT fk_fin_entradas_campanha
    FOREIGN KEY (campanha_id) REFERENCES apac_campanhas (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB
  COMMENT='Entradas de caixa';

-- Tela: /apac/financeiro (aba saídas)
CREATE TABLE apac_financeiro_saidas (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  tipo_despesa    VARCHAR(100)    NOT NULL,
  valor           DECIMAL(12, 2)  NOT NULL,
  data_lancamento DATE            NOT NULL,
  fornecedor      VARCHAR(150)    NULL,
  animal_id       BIGINT UNSIGNED NULL,
  observacoes     TEXT            NULL,
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_fin_saidas_data (data_lancamento),
  KEY idx_fin_saidas_animal (animal_id),
  CONSTRAINT fk_fin_saidas_animal
    FOREIGN KEY (animal_id) REFERENCES animais (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB
  COMMENT='Saídas de caixa';

-- =============================================================================
-- APAC – DESPESAS
-- =============================================================================

-- Tela: /apac/despesas (aba categorias)
CREATE TABLE apac_despesa_categorias (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome        VARCHAR(100)    NOT NULL,
  descricao   VARCHAR(255)    NULL,
  icone       VARCHAR(10)     NULL,
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_despesa_categorias_nome (nome)
) ENGINE=InnoDB
  COMMENT='Categorias de despesa';

-- Tela: /apac/despesas (lista e nova despesa)
CREATE TABLE apac_despesas (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  categoria_id    BIGINT UNSIGNED NULL,
  categoria_nome  VARCHAR(100)    NOT NULL,
  valor           DECIMAL(12, 2)  NOT NULL,
  data_despesa    DATE            NOT NULL,
  fornecedor      VARCHAR(150)    NULL,
  animal_id       BIGINT UNSIGNED NULL,
  forma_pagamento ENUM('PIX', 'Dinheiro', 'Cartão', 'Transferência') NOT NULL DEFAULT 'PIX',
  descricao       TEXT            NULL,
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_despesas_data (data_despesa),
  KEY idx_despesas_categoria (categoria_id),
  KEY idx_despesas_animal (animal_id),
  CONSTRAINT fk_despesas_categoria
    FOREIGN KEY (categoria_id) REFERENCES apac_despesa_categorias (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT fk_despesas_animal
    FOREIGN KEY (animal_id) REFERENCES animais (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB
  COMMENT='Despesas registradas';

-- =============================================================================
-- APAC – SAÚDE ANIMAL
-- =============================================================================

-- Tela: /apac/saude (atendimentos, exames, cirurgias)
CREATE TABLE apac_saude_registros (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  animal_id     BIGINT UNSIGNED NOT NULL,
  tipo          ENUM('consulta', 'vacina', 'exame', 'cirurgia') NOT NULL,
  titulo        VARCHAR(200)    NOT NULL,
  descricao     TEXT            NULL,
  data_registro DATE            NOT NULL,
  veterinario   VARCHAR(150)    NULL,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_saude_registros_animal (animal_id),
  KEY idx_saude_registros_tipo (tipo),
  KEY idx_saude_registros_data (data_registro),
  CONSTRAINT fk_saude_registros_animal
    FOREIGN KEY (animal_id) REFERENCES animais (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  COMMENT='Histórico de atendimentos por animal';

-- Tela: /apac/saude (carteira de vacinação)
CREATE TABLE apac_saude_vacinas (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  animal_id     BIGINT UNSIGNED NOT NULL,
  nome          VARCHAR(150)    NOT NULL,
  data_aplicada DATE            NOT NULL,
  data_proxima  DATE            NULL,
  status        ENUM('em_dia', 'a_vencer', 'vencida') NOT NULL DEFAULT 'em_dia',
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_saude_vacinas_animal (animal_id),
  KEY idx_saude_vacinas_proxima (data_proxima),
  CONSTRAINT fk_saude_vacinas_animal
    FOREIGN KEY (animal_id) REFERENCES animais (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  COMMENT='Vacinas aplicadas por animal';

-- =============================================================================
-- DADOS INICIAIS (opcional)
-- =============================================================================

INSERT INTO apac_despesa_categorias (nome, descricao, icone) VALUES
  ('Veterinário',           'Consultas, cirurgias e honorários veterinários', '🩺'),
  ('Alimentação / Ração',   'Ração, petiscos e suplementos',                  '🥣'),
  ('Medicamentos',          'Remédios, vacinas e materiais de curativo',        '💊'),
  ('Material de Limpeza',   'Produtos de higiene e limpeza do canil',           '🧴'),
  ('Transporte',            'Combustível e locomoção para resgates',            '🚗')
ON DUPLICATE KEY UPDATE
  descricao = VALUES(descricao),
  icone     = VALUES(icone);

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- Conferência: SHOW TABLES;  (deve listar 14 tabelas)
-- =============================================================================
