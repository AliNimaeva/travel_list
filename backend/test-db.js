// backend/check-db-summary.js
require('dotenv').config();
const sequelize = require('./app/config/database');

async function checkSummary() {
    console.log('📊 Сводка по базе данных\n');
    
    try {
        await sequelize.authenticate();
        
        // 1. Версия СУБД
        const [versionResult] = await sequelize.query('SELECT VERSION() as version');
        console.log(`🗃️  Версия СУБД: ${versionResult[0].version}`);
        
        // 2. Таблицы
        const [tables] = await sequelize.query(`
            SELECT TABLE_NAME as name
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = '${process.env.DB_NAME}'
            ORDER BY TABLE_NAME
        `);
        console.log(`📁 Таблиц: ${tables.length}`);
        console.log('   ' + tables.map(t => t.name).join(', '));
        
        // 3. Общее количество записей
        console.log('\n📈 Записей в таблицах:');
        for (const table of tables) {
            const [count] = await sequelize.query(`SELECT COUNT(*) as cnt FROM \`${table.name}\``);
            console.log(`   ${table.name}: ${count[0].cnt} записей`);
        }
        
        console.log('\n🎉 Готово к работе!');
        console.log('\n✅ Дальнейшие шаги:');
        console.log('1. Создать модели Sequelize (User, Travel, RoutePoint, Photo)');
        console.log('2. Настроить связи между моделями');
        console.log('3. Создать контроллеры и роуты');
        
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    } finally {
        await sequelize.close();
    }
}

checkSummary();