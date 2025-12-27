// app/models/Travel.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Travel = sequelize.define('Travel', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        country: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('planned', 'completed'),
            defaultValue: 'planned'
        },
        is_public: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        start_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        end_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        budget: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        tableName: 'travels',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true
    });

    return Travel;
};