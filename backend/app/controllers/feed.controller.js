// app/controllers/feed.controller.js
const { Travel, User, RoutePoint } = require('../models');

// Лента публичных путешествий
exports.getFeed = async (req, res) => {
    try {
        const {
            country,
            city,
            type,
            page = 1,
            limit = 10
        } = req.query;

        const offset = (page - 1) * limit;

        // Базовые условия
        const where = { is_public: true };

        if (country) where.country = country;
        if (type) where.type = type;

        // Поиск по городу (через пункты маршрута)
        let includeConditions = [
            {
                model: User,
                attributes: ['id', 'login', 'name', 'avatar_url']
            },
            { model: RoutePoint }
        ];

        if (city) {
            includeConditions[1] = {
                model: RoutePoint,
                where: { city }
            };
        }

        const travels = await Travel.findAll({
            where,
            include: includeConditions,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        // Количество всего путешествий для пагинации
        const total = await Travel.count({ where });

        res.json({
            travels,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Ошибка получения ленты:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};

// Список стран для фильтров
exports.getCountries = async (req, res) => {
    try {
        const countries = await Travel.findAll({
            attributes: ['country'],
            where: { is_public: true },
            group: ['country'],
            order: [['country', 'ASC']]
        });

        res.json(countries.map(c => c.country));

    } catch (error) {
        console.error('Ошибка получения стран:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};