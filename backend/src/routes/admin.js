const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { me, initDb, getUsers, deleteUser, promoteUser } = require('../controllers/admin');

router.get('/me', authenticate, requireAdmin, me);
router.post('/init-db', authenticate, requireAdmin, initDb);
router.get('/users', authenticate, requireAdmin, getUsers);
router.delete('/users/:id', authenticate, requireAdmin, deleteUser);
router.post('/users/:id/promote', authenticate, requireAdmin, promoteUser);

module.exports = router;