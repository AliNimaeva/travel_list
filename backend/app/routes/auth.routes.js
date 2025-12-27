// app/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Регистрация
router.post('/register', authController.register);

// Вход
router.post('/login', authController.login);

module.exports = router;