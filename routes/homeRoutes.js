const express = require('express');
const { auth } = require('../middlewares/sessionMiddleware');
const { getHome, getLogin, getLogout } = require('../services/telasServices');
const router = express.Router();

router.get('/', getHome);
router.get('/login', getLogin);
router.get('/logout', getLogout);

module.exports = router;