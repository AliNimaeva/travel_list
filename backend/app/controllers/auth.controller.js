// app/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Регистрация
exports.register = async (req, res) => {
    try {
        const { login, email, password, name, country } = req.body;

        // Проверка существования пользователя
        const existingUser = await User.findOne({
            where: { login }
        });

        if (existingUser) {
            return res.status(400).json({
                error: 'Пользователь с таким логином уже существует'
            });
        }

        // Хэширование пароля
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Создание пользователя
        const user = await User.create({
            login,
            email,
            password_hash: passwordHash,
            name,
            country
        });

        // Создание JWT токена
        const token = jwt.sign(
            { id: user.id, login: user.login },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Пользователь успешно зарегистрирован',
            user: {
                id: user.id,
                login: user.login,
                name: user.name,
                country: user.country
            },
            token
        });

    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({ error: 'Ошибка при регистрации' });
    }
};

// Логин
exports.login = async (req, res) => {
    try {
        const { login, password } = req.body;

        // Поиск пользователя
        const user = await User.findOne({
            where: { login }
        });

        if (!user) {
            return res.status(401).json({
                error: 'Неверный логин или пароль'
            });
        }

        // Проверка пароля
        const isValidPassword = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Неверный логин или пароль'
            });
        }

        // Создание JWT токена
        const token = jwt.sign(
            { id: user.id, login: user.login },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Успешный вход',
            user: {
                id: user.id,
                login: user.login,
                name: user.name,
                country: user.country,
                avatar_url: user.avatar_url
            },
            token
        });

    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({ error: 'Ошибка при входе' });
    }
};

// Получение текущего пользователя
exports.getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, {
            attributes: { exclude: ['password_hash'] }
        });

        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        res.json(user);

    } catch (error) {
        console.error('Ошибка получения пользователя:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};