const express = require('express');
const { auth } = require('../middlewares/sessionMiddleware');
const { getHome, getLogin } = require('../services/telasServices');
const router = express.Router();

router.get('/', getHome);
router.get('/login', getLogin);

module.exports = router;