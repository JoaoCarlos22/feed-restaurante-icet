const express = require('express');
const { auth } = require('../middlewares/sessionMiddleware');
const { getHome, getLogin, getCadastroUser, } = require('../services/telasServices');
const { getLogout, login, cadastrar } = require('../services/loginServices');
const router = express.Router();

router.get('/', auth, getHome);
router.get('/login', getLogin);
router.get('/cadastro', getCadastroUser);
router.get('/logout', getLogout);

router.post('/login', login);
router.post('/cadastro', cadastrar);

module.exports = router;