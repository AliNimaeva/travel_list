// app/routes/feed.routes.js
const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feed.controller');
const travelController = require('../controllers/travel.controller');

// Лента публичных путешествий
router.get('/', feedController.getFeed);

// Список стран для фильтров
router.get('/countries', feedController.getCountries);

// Получение конкретного путешествия (публичное, но с проверкой доступа)
router.get('/travel/:id', travelController.getTravel);

module.exports = router;