const express = require('express');
const router = express.Router();
const { getResearch, createResearch, updateResearch, deleteResearch } = require('../controllers/research');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getResearch);
router.post('/', createResearch);
router.put('/:id', updateResearch);
router.delete('/:id', deleteResearch);

module.exports = router;
