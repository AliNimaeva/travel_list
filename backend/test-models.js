// backend/test-models.js
require('dotenv').config();
const { sequelize, User, Travel } = require('./app/models');

async function testModels() {
    console.log('🧪 Тестирование моделей Sequelize...\n');

    try {
        // Синхронизация (без перезаписи данных)
        await sequelize.sync({ alter: true });
        console.log('✅ Модели синхронизированы с БД');

        // Тест 1: Создадим тестового пользователя
        console.log('\n1. Тест создания пользователя...');
        const testUser = await User.create({
            login: 'test_user',
            email: 'test@example.com',
            password_hash: 'hashed_password_123',
            name: 'Тестовый Пользователь',
            country: 'Россия'
        });
        console.log(`✅ Пользователь создан: ID=${testUser.id}, login=${testUser.login}`);

        // Тест 2: Создадим тестовое путешествие
        console.log('\n2. Тест создания путешествия...');
        const testTravel = await Travel.create({
            user_id: testUser.id,
            title: 'Тестовое путешествие в Москву',
            description: 'Моё первое тестовое путешествие',
            country: 'Россия',
            type: 'planned',
            is_public: true,
            start_date: '2024-06-01',
            end_date: '2024-06-07'
        });
        console.log(`✅ Путешествие создано: ID=${testTravel.id}, "${testTravel.title}"`);

        // Тест 3: Проверим связь
        console.log('\n3. Тест связи User ↔ Travel...');
        const userWithTravels = await User.findByPk(testUser.id, {
            include: [Travel]
        });
        console.log(`✅ У пользователя ${userWithTravels.login} путешествий: ${userWithTravels.Travels.length}`);

        // Тест 4: Получим все публичные путешествия (для ленты)
        console.log('\n4. Тест получения публичных путешествий...');
        const publicTravels = await Travel.findAll({
            where: { is_public: true },
            include: [User],
            limit: 5
        });
        console.log(`✅ Публичных путешествий найдено: ${publicTravels.length}`);

        // Очистка тестовых данных
        console.log('\n🧹 Очистка тестовых данных...');
        await testTravel.destroy();
        await testUser.destroy();
        console.log('✅ Тестовые данные удалены');

        console.log('\n🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ!');
        console.log('Модели Sequelize работают корректно!');

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        console.error('Детали:', error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

testModels();