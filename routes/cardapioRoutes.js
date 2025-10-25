const express = require('express');
const { auth } = require('../middlewares/sessionMiddleware');
const { telaCadCardapio, cadCardapio, telaCadPrato, cadPrato, curtirPrato, comentarPrato, getCurtidasData } = require('../services/cardapioServices');
const router = express.Router();

router.get('/pratos', auth, telaCadPrato);
router.post('/pratos/cadastrar', auth, cadPrato);
router.get('/cadastrar', auth, telaCadCardapio);
router.post('/cadastrar', auth, cadCardapio);

router.post('/pratos/:id/curtir', auth, curtirPrato);
router.post('/pratos/:id/comentar', auth, comentarPrato);

router.get('/curtidas/data', auth, getCurtidasData)

module.exports = router;