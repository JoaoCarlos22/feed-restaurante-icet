const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const homeRoutes = require('./routes/homeRoutes');
require('dotenv').config();

const PORT = process.env.PORT;
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
app.use('/', homeRoutes);

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});