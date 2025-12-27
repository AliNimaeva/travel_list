// app/models/Photo.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Photo = sequelize.define('Photo', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        url: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true
        }
    }, {
        tableName: 'photos',
        timestamps: true,
        createdAt: 'uploaded_at',
        updatedAt: false, // нет поля updated_at в таблице
        underscored: true
    });

    return Photo;
};