"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
class User extends sequelize_1.Model {
    static initialize(sequelize) {
        this.init({
            name: sequelize_1.DataTypes.STRING,
            score: sequelize_1.DataTypes.INTEGER,
        }, { modelName: "Users", sequelize: sequelize });
    }
}
exports.default = User;
