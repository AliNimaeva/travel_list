// app/routes/travel.routes.js
const express = require('express');
const router = express.Router();
const travelController = require('../controllers/travel.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Все маршруты требуют авторизации
router.use(authMiddleware);

// Создание путешествия
router.post('/', travelController.createTravel);

// Получение путешествий пользователя
router.get('/my', travelController.getUserTravels);

router.put('/:id', travelController.updateUserTravels)

router.delete('/:id', travelController.deleteUserTravels)

router.get('/user/:userId', travelController.getUserTravels);

module.exports = router;