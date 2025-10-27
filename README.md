# RU ICET - Restaurante Universitário

## Descrição

- Aplicação em Node.js/Express para cadastrar cardápios e exibir pratos semanais.

## Tecnologias

- Node.js + Express ([package.json](package.json))
- EJS para templates (views/)
- MySQL via [mysql2]([db/connection.js]) (pool em [`db/connection.js`](db/connection.js))
- Sessões com `express-session` (`app.js`)
- Bootstrap 5 para UI (public/css/, views/)
- Chart.js para o gráfico (public/js/home.js)

## Pré-requisitos

- Node.js (v18+ recomendado)
- MySQL acessível e banco configurado
- Arquivo .env com variáveis abaixo (crie a partir de um exemplo):
  - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
  - PORT (ex: 3000)
  - SESSION_SECRET

## Instalação / Execução

1. Instalar dependências:
   npm install
2. Configurar .env com variáveis do banco e SESSION_SECRET.
3. Iniciar a aplicação (usa nodemon):
   npm start
4. Acesse: http://localhost:<PORT>

## Estrutura de diretórios

- app.js — ponto de entrada ([app.js](app.js))
- package.json — dependências e scripts ([package.json](package.json))
- db/
  - connection.js — pool MySQL ([db/connection.js](db/connection.js))
- routes/
  - homeRoutes.js ([routes/homeRoutes.js](routes/homeRoutes.js))
  - cardapioRoutes.js ([routes/cardapioRoutes.js](routes/cardapioRoutes.js))
- services/
  - telasServices.js — renderiza views, função principal [`telasServices.getHome`](services/telasServices.js)
  - cardapioServices.js — lógica de cardápio, cadastro e curtidas (ex: [`cardapioServices.cadCardapio`](services/cardapioServices.js), [`cardapioServices.getCurtidasData`](services/cardapioServices.js))
  - loginServices.js — autenticação/registro ([`loginServices.login`](services/loginServices.js))
- public/
  - css/navbar.css — estilos do cabeçalho/rodapé ([public/css/navbar.css](public/css/navbar.css))
  - css/home.css — estilos da home ([public/css/home.css](public/css/home.css))
  - js/home.js — gráfico e handlers ([public/js/home.js](public/js/home.js))
  - js/cadastroCardapio.js — lógica do form de cardápio ([public/js/cadastroCardapio.js](public/js/cadastroCardapio.js))
- views/ — EJS templates
  - home.ejs ([views/home.ejs](views/home.ejs))
  - cadastroCardapio.ejs ([views/cadastroCardapio.ejs](views/cadastroCardapio.ejs))
  - cadastroPrato.ejs, cadastroUser.ejs, login.ejs, paginaErro.ejs
  - partials/footer.ejs — footer padronizado ([views/partials/footer.ejs](views/partials/footer.ejs))

## Estrutura do banco de dados

O projeto usa MySQL. Abaixo está um arquivo explicando as tabelas, chaves e relacionamentos de modo que fique compatível com a lógica usada em [`services/cardapioServices.js`](services/cardapioServices.js) e [`public/js/home.js`](public/js/home.js).

Arquivo: [DATABASE.md](DATABASE.md)

Pontos importantes / Notas
- Rotas principais estão em [routes/homeRoutes.js](routes/homeRoutes.js) e [routes/cardapioRoutes.js](routes/cardapioRoutes.js).
- Lógica de validação do cardápio (1 prato do dia por dia) é em [`cardapioServices.cadCardapio`](services/cardapioServices.js).
- Gráfico de curtidas carrega dados de [`cardapioServices.getCurtidasData`](services/cardapioServices.js) e é renderizado via [public/js/home.js](public/js/home.js).
- Sessões são obrigatórias para acessar rotas protegidas (middleware em [middlewares/sessionMiddleware.js](middlewares/sessionMiddleware.js)).
