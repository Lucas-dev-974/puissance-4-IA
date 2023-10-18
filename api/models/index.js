"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.Database = void 0;
const sequelize_1 = require("sequelize");
// @ts-ignore
const config_json_1 = __importDefault(require("../config/config.json"));
const user_1 = __importDefault(require("./user"));
exports.User = user_1.default;
const sequelize = new sequelize_1.Sequelize(config_json_1.default["development"]);
exports.Database = sequelize;
// Initialize each model in the database
// This must be done before associations are made
const models = [user_1.default];
models.forEach((model) => model.initialize(sequelize));
sequelize.sync({ force: true });
