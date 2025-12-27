// app/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Все маршруты требуют авторизации
router.use(authMiddleware);

router.get('/:username', userController.getUserProfile);
router.put('/profile', authenticateToken, userController.updateProfile);
router.get('/:userId/stats', authenticateToken, userController.getUserStats)
module.exports = router;