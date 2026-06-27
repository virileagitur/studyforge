const express = require('express');
const router = express.Router();
const { register, login, logout, me, updateProfile, googleLogin, onboarding, deleteAccount } = require('../controllers/auth');
const { authenticate } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);
router.put('/profile', authenticate, updateProfile);
router.post('/onboarding', authenticate, onboarding);
router.delete('/me', authenticate, deleteAccount);
router.post('/google', googleLogin);

module.exports = router;
