-- Schema relacional para o sistema RU ICET
-- Banco-alvo: MySQL / MariaDB (InnoDB, utf8mb4)
-- Tabelas: prato, comentario, cardapio, cardapio_prato

-- Tabela `prato`: pratos individuais
CREATE TABLE IF NOT EXISTS `prato` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `descricao` TEXT NULL,
  `imagem` VARCHAR(255) NULL,
  `prato_dia` TINYINT(1) NOT NULL DEFAULT 0,
  `curtidas` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_prato_dia` (`prato_dia`),
  INDEX `idx_nome` (`nome`(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela `comentario`: comentários normalizados por prato
CREATE TABLE IF NOT EXISTS `comentario` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `prato_id` INT NOT NULL,
  `usuario_id` INT NULL,
  `texto` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_coment_prato` (`prato_id`),
  INDEX `idx_coment_usuario` (`usuario_id`),
  CONSTRAINT `fk_coment_prato` FOREIGN KEY (`prato_id`) REFERENCES `prato`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_coment_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela `cardapio`: representa um intervalo de datas (por exemplo, semana) com associação aos pratos
CREATE TABLE IF NOT EXISTS `cardapio` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `dia_inicial` DATE NOT NULL,
  `dia_final` DATE NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_periodo` (`dia_inicial`, `dia_final`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela `cardapio_prato`: ligação many-to-many entre cardapio e prato, com dia da semana e ordenação
-- dia_semana: ENUM para facilitar leitura; valores: 'segunda','terca','quarta','quinta','sexta'
CREATE TABLE IF NOT EXISTS `cardapio_prato` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `cardapio_id` INT NOT NULL,
  `prato_id` INT NOT NULL,
  `dia_semana` ENUM('segunda','terca','quarta','quinta','sexta') NOT NULL,
  `posicao` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `idx_cp_cardapio` (`cardapio_id`),
  INDEX `idx_cp_prato` (`prato_id`),
  CONSTRAINT `fk_cp_cardapio` FOREIGN KEY (`cardapio_id`) REFERENCES `cardapio`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cp_prato` FOREIGN KEY (`prato_id`) REFERENCES `prato`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela `usuario`: armazena usuários do sistema (ex.: alunos/funcionários)
CREATE TABLE IF NOT EXISTS `usuario` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `senha` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_usuario_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Observação de segurança: armazene apenas hashes de senha (bcrypt/argon2) em `usuario.senha`, nunca senhas em texto claro.

-- Opcional: tabela `curtida` para rastrear curtidas por usuário (se necessário no futuro)
-- CREATE TABLE IF NOT EXISTS `curtida` (
--   `id` INT NOT NULL AUTO_INCREMENT,
--   `prato_id` INT NOT NULL,
--   `usuario_id` INT NULL,
--   `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   PRIMARY KEY(`id`),
--   INDEX `idx_curt_prato` (`prato_id`),
--   CONSTRAINT `fk_curt_prato` FOREIGN KEY (`prato_id`) REFERENCES `prato`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exemplos de uso (inserts):
-- Inserir pratos
-- INSERT INTO `prato` (`nome`, `descricao`, `imagem`, `prato_dia`, `curtidas`) VALUES
-- ('Arroz e Feijão', 'Prato tradicional', 'arroz_feijao.jpg', 1, 10),
-- ('Macarronada', 'Macarrão ao sugo', 'macarrao.jpg', 0, 3);

-- Inserir cardapio (sem associação ainda)
-- INSERT INTO `cardapio` (`dia_inicial`, `dia_final`) VALUES ('2025-10-20', '2025-10-24');

-- Associar pratos ao cardapio por dia
-- INSERT INTO `cardapio_prato` (`cardapio_id`, `prato_id`, `dia_semana`, `posicao`) VALUES
-- (1, 1, 'segunda', 1),
-- (1, 2, 'terça', 1);

-- Inserir comentário para um prato (com usuário existente)
-- INSERT INTO `comentario` (`prato_id`, `usuario_id`, `texto`) VALUES (1, 1, 'Muito bom!');
-- Inserir comentário anônimo (usuario_id NULL)
-- INSERT INTO `comentario` (`prato_id`, `usuario_id`, `texto`) VALUES (1, NULL, 'Comentário anônimo');
-- 2) `cardapio_prato` permite relacionar múltiplos pratos por dia, por cardápio (semana) com ordenação (`posicao`).
-- 3) Se quiser rastrear curtidas por usuário, descomente e use a tabela `curtida` e mantenha `prato.curtidas` como contagem/cache.
