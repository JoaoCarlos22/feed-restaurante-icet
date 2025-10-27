Crie o banco e execute as instruções SQL abaixo (MySQL / Workbench / CLI):

```sql
-- Ajuste o charset/collation conforme sua necessidade
CREATE DATABASE IF NOT EXISTS ru_icet DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ru_icet;

-- usuários
CREATE TABLE usuario (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- pratos
CREATE TABLE prato (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  imagem VARCHAR(255),
  preco DECIMAL(10,2) DEFAULT NULL,
  curtidas INT UNSIGNED DEFAULT 0,
  prato_dia TINYINT(1) DEFAULT 0, -- flag usada para destacar prato do dia
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (nome)
) ENGINE=InnoDB;

-- cardápios (períodos)
CREATE TABLE cardapio (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  dia_inicial DATE NOT NULL,
  dia_final DATE NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- relação cardapio <-> prato, com dia da semana e posição
CREATE TABLE cardapio_prato (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cardapio_id INT UNSIGNED NOT NULL,
  prato_id INT UNSIGNED NOT NULL,
  dia_semana ENUM('segunda','terça','quarta','quinta','sexta') NOT NULL,
  posicao INT DEFAULT 0,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cardapio_id) REFERENCES cardapio(id) ON DELETE CASCADE,
  FOREIGN KEY (prato_id) REFERENCES prato(id) ON DELETE CASCADE,
  INDEX (cardapio_id),
  INDEX (prato_id),
  INDEX (dia_semana)
) ENGINE=InnoDB;

-- curtidas: cada usuário pode curtir um prato uma vez
CREATE TABLE curtida (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  prato_id INT UNSIGNED NOT NULL,
  usuario_id INT UNSIGNED NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prato_id) REFERENCES prato(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_prato_usuario (prato_id, usuario_id),
  INDEX (prato_id),
  INDEX (usuario_id)
) ENGINE=InnoDB;

-- comentários dos usuários sobre pratos
CREATE TABLE comentario (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  prato_id INT UNSIGNED NOT NULL,
  usuario_id INT UNSIGNED NOT NULL,
  texto TEXT NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prato_id) REFERENCES prato(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
  INDEX (prato_id),
  INDEX (usuario_id)
) ENGINE=InnoDB;
```

## Notas e mapeamento com o projeto

- A coluna `prato.prato_dia` é usada por [`cardapioServices.cadCardapio`](services/cardapioServices.js) para marcar pratos destacados.
- A coluna `prato.curtidas` é incrementada ao registrar curtidas via rota em [routes/cardapioRoutes.js](routes/cardapioRoutes.js) e mostrada em [views/home.ejs](views/home.ejs) / [public/js/home.js](public/js/home.js).
- A tabela `cardapio_prato` armazena quais pratos pertencem ao cardápio atual e em qual `dia_semana` e `posicao` aparecem (usada ao montar o JSON em [`public/js/cadastroCardapio.js`](public/js/cadastroCardapio.js)).
- Use [db/connection.js](db/connection.js) para configurar a conexão (variáveis no `.env`).