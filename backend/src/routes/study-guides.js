const express = require('express');
const router = express.Router();
const { getStudyGuides, createStudyGuide, deleteStudyGuide } = require('../controllers/study-guides');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', getStudyGuides);
router.post('/', createStudyGuide);
router.delete('/:id', deleteStudyGuide);

module.exports = router;
