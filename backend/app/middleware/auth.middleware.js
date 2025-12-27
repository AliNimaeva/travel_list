// app/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'secret'
        );

        req.userId = decoded.id;
        req.userLogin = decoded.login;

        next();

    } catch (error) {
        console.error('Ошибка авторизации:', error);
        res.status(401).json({ error: 'Неверный токен' });
    }
};