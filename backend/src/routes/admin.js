const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { me } = require('../controllers/admin');

router.get('/me', authenticate, requireAdmin, me);

module.exports = router;