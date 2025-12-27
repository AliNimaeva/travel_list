// app/routes/index.js
const express = require('express');
const router = express.Router();

// Импорт всех роутов
const authRoutes = require('./auth.routes');
const travelRoutes = require('./travel.routes');
const feedRoutes = require('./feed.routes');
const userRoutes = require('./user.routes');

// Подключение middleware для авторизации
const authMiddleware = require('../middleware/auth.middleware');

// Публичные маршруты
router.use('/auth', authRoutes);
router.use('/feed', feedRoutes);

// Защищенные маршруты (требуют авторизации)
router.use('/travels', authMiddleware, travelRoutes);

// Маршрут для получения текущего пользователя (требует авторизации)
router.get('/auth/me', authMiddleware, require('../controllers/auth.controller').getMe);

router.use('/users', authMiddleware, userRoutes);

module.exports = router;