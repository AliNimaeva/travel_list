// app/controllers/travel.controller.js
const { Travel, RoutePoint, Photo, User } = require('../models');

// Создание путешествия
exports.createTravel = async (req, res) => {
    try {
        const {
            title,
            description,
            country,
            type,
            is_public,
            start_date,
            end_date,
            budget,
            route_points
        } = req.body;

        const travel = await Travel.create({
            title,
            description,
            country,
            type: type || 'planned',
            is_public: is_public !== undefined ? is_public : true,
            start_date,
            end_date,
            budget,
            user_id: req.userId
        });

        // Если есть пункты маршрута
        if (route_points && Array.isArray(route_points)) {
            for (const point of route_points) {
                await RoutePoint.create({
                    travel_id: travel.id,
                    city: point.city,
                    order: point.order,
                    visit_date: point.visit_date,
                    description: point.description
                });
            }
        }

        const travelWithDetails = await Travel.findByPk(travel.id, {
            include: [
                { model: RoutePoint },
                { model: User, attributes: ['id', 'login', 'name', 'avatar_url'] }
            ]
        });

        res.status(201).json({
            message: 'Путешествие создано',
            travel: travelWithDetails
        });

    } catch (error) {
        console.error('Ошибка создания путешествия:', error);
        res.status(500).json({ error: 'Ошибка при создании путешествия' });
    }
};

// Получение всех путешествий пользователя
exports.getUserTravels = async (req, res) => {
    try {
        const travels = await Travel.findAll({
            where: { user_id: req.userId },
            include: [
                { model: RoutePoint },
                { model: Photo, limit: 1 }, // Первое фото для превью
                { model: User, attributes: ['id', 'login', 'name', 'avatar_url'] }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json(travels);

    } catch (error) {
        console.error('Ошибка получения путешествий:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};

// Получение одного путешествия
exports.getTravel = async (req, res) => {
    try {
        const travel = await Travel.findByPk(req.params.id, {
            include: [
                { model: RoutePoint, order: [['order', 'ASC']] },
                { model: Photo },
                { model: User, attributes: ['id', 'login', 'name', 'avatar_url'] }
            ]
        });

        if (!travel) {
            return res.status(404).json({ error: 'Путешествие не найдено' });
        }

        // Проверка доступа (публичное или своё)
        if (!travel.is_public && travel.user_id !== req.userId) {
            return res.status(403).json({ error: 'Нет доступа к этому путешествию' });
        }

        res.json(travel);

    } catch (error) {
        console.error('Ошибка получения путешествия:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};

exports.updateUserTravels = async (req, res) => {
    try {
        const travelId = req.params.id;
        const userId = req.userId;

        const {
            title,
            description,
            country,
            type,
            is_public,
            start_date,
            end_date,
            budget,
            route_points
        } = req.body;

        console.log(`🔄 Обновление путешествия ID: ${travelId} для пользователя ID: ${userId}`);

        // 1. Находим путешествие
        const travel = await Travel.findByPk(travelId);

        if (!travel) {
            return res.status(404).json({
                error: 'Путешествие не найдено'
            });
        }

        // 2. Проверяем права доступа
        if (travel.user_id !== userId) {
            return res.status(403).json({
                error: 'Недостаточно прав для редактирования этого путешествия'
            });
        }

        // 3. Подготавливаем данные для обновления
        const updateData = {};

        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (country !== undefined) updateData.country = country;
        if (type !== undefined) updateData.type = type;
        if (is_public !== undefined) updateData.is_public = is_public;
        if (start_date !== undefined) updateData.start_date = start_date;
        if (end_date !== undefined) updateData.end_date = end_date;
        if (budget !== undefined) updateData.budget = budget;

        // 4. Обновляем основную информацию
        await travel.update(updateData);

        // 5. Обновляем пункты маршрута (если переданы)
        if (route_points && Array.isArray(route_points)) {
            // Удаляем старые пункты
            await RoutePoint.destroy({
                where: { travel_id: travelId }
            });

            // Создаем новые пункты
            for (const point of route_points) {
                await RoutePoint.create({
                    travel_id: travelId,
                    city: point.city,
                    order: point.order || 0,
                    visit_date: point.visit_date,
                    description: point.description
                });
            }
        }

        // 6. Получаем обновленное путешествие с вложенными данными
        const updatedTravel = await Travel.findByPk(travelId, {
            include: [
                {
                    model: RoutePoint,
                    order: [['order', 'ASC']]
                },
                {
                    model: Photo
                },
                {
                    model: User,
                    attributes: ['id', 'login', 'name', 'avatar_url']
                }
            ]
        });

        console.log(`✅ Путешествие ID: ${travelId} успешно обновлено`);

        res.json({
            message: 'Путешествие успешно обновлено',
            travel: updatedTravel
        });

    } catch (error) {
        console.error('❌ Ошибка обновления путешествия:', error);

        // Проверяем ошибки валидации
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(err => err.message);
            return res.status(400).json({
                error: 'Ошибка валидации',
                details: errors
            });
        }

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                error: 'Нарушение уникальности данных'
            });
        }

        res.status(500).json({
            error: 'Ошибка сервера при обновлении путешествия',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.deleteUserTravels = async (req, res) => {
    try {
        const travelId = req.params.id;
        const userId = req.userId;

        console.log(`🗑️  Удаление путешествия ID: ${travelId} пользователем ID: ${userId}`);

        // 1. Находим путешествие
        const travel = await Travel.findByPk(travelId);

        if (!travel) {
            return res.status(404).json({
                error: 'Путешествие не найдено'
            });
        }

        // 2. Проверяем права доступа
        if (travel.user_id !== userId) {
            return res.status(403).json({
                error: 'Недостаточно прав для удаления этого путешествия'
            });
        }

        // 3. Удаляем связанные фотографии (если они хранятся в файловой системе)
        // Сначала получаем все фото
        const photos = await Photo.findAll({
            where: { travel_id: travelId }
        });

        // Если фото хранятся локально, удаляем файлы
        if (photos.length > 0) {
            const fs = require('fs');
            const path = require('path');

            for (const photo of photos) {
                if (photo.url && photo.url.startsWith('/uploads/')) {
                    const filePath = path.join(__dirname, '..', '..', photo.url);

                    if (fs.existsSync(filePath)) {
                        try {
                            fs.unlinkSync(filePath);
                            console.log(`🗑️  Удален файл: ${filePath}`);
                        } catch (fileError) {
                            console.warn(`⚠️  Не удалось удалить файл ${filePath}:`, fileError.message);
                        }
                    }
                }
            }
        }

        // 4. Удаляем связанные записи из БД
        // Удаляем пункты маршрута (cascade должно сработать, но для надежности удаляем явно)
        await RoutePoint.destroy({
            where: { travel_id: travelId }
        });

        // Удаляем фотографии из БД
        await Photo.destroy({
            where: { travel_id: travelId }
        });

        // 5. Удаляем само путешествие
        await travel.destroy();

        console.log(`✅ Путешествие ID: ${travelId} успешно удалено`);

        res.json({
            message: 'Путешествие успешно удалено',
            deletedId: travelId
        });

    } catch (error) {
        console.error('❌ Ошибка удаления путешествия:', error);

        // Проверяем foreign key constraints
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(409).json({
                error: 'Не удалось удалить путешествие из-за связанных данных'
            });
        }

        res.status(500).json({
            error: 'Ошибка сервера при удалении путешествия',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};