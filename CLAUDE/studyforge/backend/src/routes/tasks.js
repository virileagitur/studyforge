const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask, completeTask } = require('../controllers/tasks');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/complete', completeTask);

module.exports = router;
