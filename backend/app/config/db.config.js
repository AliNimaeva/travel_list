require('dotenv').config();

const getDbHost = () => {
    var currentIP = '';
    if (process.env.DB_HOST)
        currentIP = process.env.DB_HOST;
    else if (process.platform === 'linux')
        currentIP = '172.24.208.1';
    else
        currentIP = 'localhost';
    return currentIP;
};


const dbConfig = {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: getDbHost(),
    port: process.env.DB_PORT,
    dialect: 'mysql',
    dialectModule: require('mysql2'),
    
    pool: {
        max: parseInt(process.env.DB_POOL_MAX),
        min: parseInt(process.env.DB_POOL_MIN),
        acquire: parseInt(process.env.DB_POOL_ACQUIRE),
        idle: parseInt(process.env.DB_POOL_IDLE)
    },

    define: {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true,
        paranoid: false
    }
};

module.exports = dbConfig;