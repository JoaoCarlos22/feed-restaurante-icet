const express = require('express');
const { auth } = require('../middlewares/sessionMiddleware');
const { telaCadCardapio, cadCardapio } = require('../services/cardapioServices');
const router = express.Router();

router.get('/cadastrar', auth, telaCadCardapio);
router.post('/cadastrar', auth, cadCardapio);

module.exports = router;