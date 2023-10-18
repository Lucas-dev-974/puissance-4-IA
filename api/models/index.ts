import { Sequelize } from "sequelize";

// @ts-ignore
import config from "../config/config.json";
import User from "./user";

const sequelize = new Sequelize(config["development"]);

// Initialize each model in the database
// This must be done before associations are made
const models = [User];
models.forEach((model) => model.initialize(sequelize));
sequelize.sync({ force: true });

export { sequelize as Database, User };
