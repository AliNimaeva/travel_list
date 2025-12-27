// app/config/database.js
const { Sequelize } = require('sequelize');
const dbConfig = require('./db.config');

// Создаём экземпляр Sequelize с нашей конфигурацией
const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        dialectModule: dbConfig.dialectModule,
        pool: dbConfig.pool,
        define: dbConfig.define,
    }
);

// Функция для проверки подключения
sequelize.testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Подключение к MySQL успешно установлено');

        // Дополнительная информация
        const [result] = await sequelize.query('SELECT DATABASE() as db, USER() as user');
        console.log(`📊 База данных: ${result[0].db}`);
        console.log(`👤 Пользователь: ${result[0].user}`);

        return true;
    } catch (error) {
        console.error('❌ Ошибка подключения к MySQL:', error.message);
        console.log('\n🔧 Устранение неполадок:');
        console.log('1. Проверьте, запущен ли MySQL на Windows');
        console.log('2. Проверьте логин/пароль в .env файле');
        console.log('3. Проверьте IP адрес Windows хоста');
        console.log('4. Проверьте доступность порта 3306 из WSL');
        return false;
    }
};

module.exports = sequelize;