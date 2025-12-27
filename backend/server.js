// backend/server.js
const path = require('path');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./app/models');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: 'http://localhost:3001', // или ['http://localhost:3001', 'http://localhost:3000']
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы
app.use('/uploads', express.static('app/uploads'));

// Маршруты API
app.use('/api', require('./app/routes'));

// Простой маршрут для проверки
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Travel Online API работает',
        timestamp: new Date().toISOString(),
        endpoints: [
            'POST /api/auth/register',
            'POST /api/auth/login',
            'GET  /api/feed',
            'GET  /api/countries',
            'GET  /api/auth/me (требуется токен)',
            'POST /api/travels (требуется токен)',
            'GET  /api/travels/my (требуется токен)',
            'GET  /api/travels/:id',
            'GET  /api/travels/user/:userId',
            'GET  /api/user/:username',
            'PUT  /api/user/profile'
        ]
    });
});

// Обработка 404
app.use((req, res) => {
    res.status(404).json({ error: 'Маршрут не найден' });
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// Запуск сервера
async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('✅ База данных подключена');

        await sequelize.sync({ alter: true });
        console.log('✅ Модели синхронизированы');

        app.listen(PORT, () => {
            console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
            console.log(`📡 API доступно: http://localhost:${PORT}/api/health`);
            console.log('\n📋 Доступные эндпоинты:');
            console.log('  🔐 Авторизация:');
            console.log('    POST /api/auth/register');
            console.log('    POST /api/auth/login');
            console.log('    GET  /api/auth/me (с токеном)');
            console.log('  🌍 Лента путешествий:');
            console.log('    GET  /api/feed');
            console.log('    GET  /api/countries');
            console.log('  🗺️  Путешествия:');
            console.log('    POST /api/travels (с токеном)');
            console.log('    GET  /api/travels/my (с токеном)');
            console.log('    GET  /api/travels/:id');
        });

    } catch (error) {
        console.error('❌ Ошибка запуска:', error);
        process.exit(1);
    }
}

startServer();

// В server.js добавьте после запуска сервера:
console.log('\n🔧 Для тестирования API выполните:');
console.log('   npm run test:api');
console.log('\n📝 Примеры запросов:');
console.log('   Регистрация:');
console.log('     curl -X POST http://localhost:3000/api/auth/register \\');
console.log('          -H "Content-Type: application/json" \\');
console.log('          -d \'{"login":"test","email":"test@test.com","password":"123","name":"Test"}\'');
console.log('');
console.log('   Получение ленты:');
console.log('     curl http://localhost:3000/api/feed');