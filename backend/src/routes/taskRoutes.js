
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const taskController = require('../controllers/taskController');

// Rate limit básico para mitigar abuso (ajustar conforme necessidade)
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutos
	max: 300, // máximo de requisições por IP nesse intervalo
	standardHeaders: true,
	legacyHeaders: false
});

router.get('/tasks', apiLimiter, taskController.getTasks);
router.post('/tasks', apiLimiter, taskController.createTask);
router.put('/tasks/:id', apiLimiter, taskController.updateTask);
router.delete('/tasks/:id', apiLimiter, taskController.deleteTask);

module.exports = router;
