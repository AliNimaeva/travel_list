// app/controllers/user.controller.js
const { User, Travel, RoutePoint, Photo } = require('../models');
const { Op } = require('sequelize');

// Получение профиля пользователя по username
exports.getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;

        console.log(`👤 Запрос профиля пользователя: ${username}`);

        // Находим пользователя
        const user = await User.findOne({
            where: {
                login: username
            },
            attributes: [
                'id',
                'login',
                'email',
                'name',
                'avatar',
                'country',
                'bio',
                'created_at',
                'updated_at'
            ]
        });

        if (!user) {
            return res.status(404).json({
                error: 'Пользователь не найден'
            });
        }

        // Получаем статистику путешествий пользователя
        const travels = await Travel.findAll({
            where: {
                user_id: user.id,
                is_public: true // Только публичные для просмотра чужого профиля
            },
            attributes: ['id', 'type', 'country', 'is_public']
        });

        // Считаем статистику
        const stats = {
            totalTravels: travels.length,
            plannedTravels: travels.filter(t => t.type === 'planned').length,
            completedTravels: travels.filter(t => t.type === 'completed').length,
            publicTravels: travels.filter(t => t.is_public).length,
            visitedCountries: [...new Set(travels.map(t => t.country).filter(Boolean))].length
        };

        // Получаем последние 3 публичных путешествия для превью
        const recentTravels = await Travel.findAll({
            where: {
                user_id: user.id,
                is_public: true
            },
            include: [
                {
                    model: Photo,
                    attributes: ['url'],
                    limit: 1
                },
                {
                    model: RoutePoint,
                    attributes: ['city'],
                    limit: 1
                }
            ],
            attributes: [
                'id',
                'title',
                'country',
                'type',
                'start_date',
                'end_date',
                'created_at'
            ],
            order: [['created_at', 'DESC']],
            limit: 3
        });

        const responseData = {
            user: {
                id: user.id,
                login: user.login,
                name: user.name,
                avatar: user.avatar,
                avatar_url: user.avatar, // для совместимости
                country: user.country,
                bio: user.bio,
                email: req.user?.id === user.id ? user.email : undefined, // email только себе
                created_at: user.created_at,
                updated_at: user.updated_at
            },
            stats,
            recentTravels
        };

        console.log(`✅ Профиль пользователя ${username} успешно загружен`);
        res.json(responseData);

    } catch (error) {
        console.error('❌ Ошибка получения профиля пользователя:', error);
        res.status(500).json({
            error: 'Ошибка сервера при получении профиля',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Обновление профиля текущего пользователя
 * PUT /api/users/profile
 */
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, bio, country, avatar } = req.body;

        console.log(`🔄 Обновление профиля пользователя ID: ${userId}`);
        console.log('📝 Данные для обновления:', { name, bio, country, avatar });

        // Находим пользователя
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                error: 'Пользователь не найден'
            });
        }

        // Подготавливаем данные для обновления
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (bio !== undefined) updateData.bio = bio;
        if (country !== undefined) updateData.country = country;
        if (avatar !== undefined) updateData.avatar = avatar;

        // Валидация данных
        if (name && name.length < 2) {
            return res.status(400).json({
                error: 'Имя должно содержать минимум 2 символа'
            });
        }

        if (bio && bio.length > 500) {
            return res.status(400).json({
                error: 'Био не может превышать 500 символов'
            });
        }

        // Обновляем пользователя
        await user.update(updateData);

        // Получаем обновленные данные
        const updatedUser = await User.findByPk(userId, {
            attributes: [
                'id',
                'login',
                'email',
                'name',
                'avatar',
                'country',
                'bio',
                'created_at',
                'updated_at'
            ]
        });

        console.log(`✅ Профиль пользователя ID: ${userId} успешно обновлен`);

        res.json({
            message: 'Профиль успешно обновлен',
            user: {
                ...updatedUser.toJSON(),
                avatar_url: updatedUser.avatar // для совместимости
            }
        });

    } catch (error) {
        console.error('❌ Ошибка обновления профиля:', error);

        // Обработка ошибок валидации Sequelize
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(err => ({
                field: err.path,
                message: err.message
            }));

            return res.status(400).json({
                error: 'Ошибка валидации данных',
                details: errors
            });
        }

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                error: 'Пользователь с такими данными уже существует'
            });
        }

        res.status(500).json({
            error: 'Ошибка сервера при обновлении профиля',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


/**
 * Получение статистики пользователя
 * GET /api/users/:userId/stats
 */
exports.getUserStats = async (req, res) => {
    try {
        const { userId } = req.params;

        console.log(`📊 Запрос статистики пользователя ID: ${userId}`);

        // Проверяем, существует ли пользователь
        const user = await User.findByPk(userId, {
            attributes: ['id', 'login', 'name']
        });

        if (!user) {
            return res.status(404).json({
                error: 'Пользователь не найден'
            });
        }

        // Получаем все путешествия пользователя
        const travels = await Travel.findAll({
            where: { user_id: userId },
            attributes: ['id', 'type', 'country', 'is_public', 'start_date', 'end_date'],
            include: [
                {
                    model: Photo,
                    attributes: ['id'],
                    separate: true
                },
                {
                    model: RoutePoint,
                    attributes: ['id'],
                    separate: true
                }
            ]
        });

        // Вычисляем статистику
        const totalPhotos = travels.reduce((sum, travel) => sum + (travel.Photos?.length || 0), 0);
        const totalRoutePoints = travels.reduce((sum, travel) => sum + (travel.RoutePoints?.length || 0), 0);

        // Находим страны
        const countries = [...new Set(travels.map(t => t.country).filter(Boolean))];

        // Находим самый популярный месяц для путешествий
        const monthCounts = {};
        travels.forEach(travel => {
            if (travel.start_date) {
                const month = new Date(travel.start_date).getMonth();
                monthCounts[month] = (monthCounts[month] || 0) + 1;
            }
        });

        const mostActiveMonth = Object.keys(monthCounts).length > 0
            ? Object.keys(monthCounts).reduce((a, b) => monthCounts[a] > monthCounts[b] ? a : b)
            : null;

        const stats = {
            totalTravels: travels.length,
            plannedTravels: travels.filter(t => t.type === 'planned').length,
            completedTravels: travels.filter(t => t.type === 'completed').length,
            publicTravels: travels.filter(t => t.is_public).length,
            privateTravels: travels.filter(t => !t.is_public).length,
            visitedCountries: countries.length,
            countriesList: countries,
            totalPhotos,
            totalRoutePoints,
            mostActiveMonth: mostActiveMonth ?
                new Date(0, mostActiveMonth).toLocaleString('ru-RU', { month: 'long' }) :
                null,
            avgTravelDuration: travels.length > 0 ?
                travels.reduce((sum, t) => {
                    if (t.start_date && t.end_date) {
                        const start = new Date(t.start_date);
                        const end = new Date(t.end_date);
                        return sum + ((end - start) / (1000 * 60 * 60 * 24));
                    }
                    return sum;
                }, 0) / travels.filter(t => t.start_date && t.end_date).length :
                0
        };

        console.log(`✅ Статистика пользователя ID: ${userId} загружена`);

        res.json({
            user: {
                id: user.id,
                login: user.login,
                name: user.name
            },
            stats
        });

    } catch (error) {
        console.error('❌ Ошибка получения статистики:', error);
        res.status(500).json({
            error: 'Ошибка сервера при получении статистики'
        });
    }
};

