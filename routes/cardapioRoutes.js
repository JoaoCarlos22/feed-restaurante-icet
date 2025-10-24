const express = require('express');
const { auth } = require('../middlewares/sessionMiddleware');
const { telaCadCardapio, cadCardapio, telaCadPrato, cadPrato } = require('../services/cardapioServices');
const router = express.Router();

router.get('/pratos', auth, telaCadPrato);
router.post('/pratos/cadastrar', auth, cadPrato);
router.get('/cadastrar', auth, telaCadCardapio);
router.post('/cadastrar', auth, cadCardapio);

module.exports = router;