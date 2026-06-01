-- Corrige bancos criados pelo schema antigo (sem limite_baixo_estoque).
-- Seguro ignorar erro "Duplicate column" se a coluna já existir.
USE sipan;

ALTER TABLE apac_estoque
  ADD COLUMN limite_baixo_estoque INT UNSIGNED NOT NULL DEFAULT 5 AFTER local;
