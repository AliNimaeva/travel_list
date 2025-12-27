const sequelize = require('../config/database');

const UserModel = require('./User');
const TravelModel = require('./Travel');
const RoutePointModel = require('./RoutePoint');
const PhotoModel = require('./Photo');

const User = UserModel(sequelize);
const Travel = TravelModel(sequelize);
const RoutePoint = RoutePointModel(sequelize);
const Photo = PhotoModel(sequelize);


// 1. User - Travel (один ко многим)
User.hasMany(Travel, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE'
});
Travel.belongsTo(User, {
  foreignKey: 'user_id'
});

// 2. Travel - RoutePoint (один ко многим)
Travel.hasMany(RoutePoint, {
  foreignKey: 'travel_id',
  onDelete: 'CASCADE'
});
RoutePoint.belongsTo(Travel, {
  foreignKey: 'travel_id'
});

// 3. RoutePoint - Photo (один ко многим)
RoutePoint.hasMany(Photo, {
  foreignKey: 'route_point_id',
  onDelete: 'CASCADE'
});
Photo.belongsTo(RoutePoint, {
  foreignKey: 'route_point_id'
});

// 4. Travel - Photo (один ко многим) - для фото, привязанных к путешествию в целом
Travel.hasMany(Photo, {
  foreignKey: 'travel_id',
  onDelete: 'CASCADE'
});
Photo.belongsTo(Travel, {
  foreignKey: 'travel_id'
});

// Экспорт
module.exports = {
  sequelize,
  User,
  Travel,
  RoutePoint,
  Photo
};