"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.APP_PORT;
app.get('/', (req, res) => {
    res.send("l'application puissance 4 API est en cour de de construction, teste 1");
});
const httpServer = new http_1.Server(app);
httpServer.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
// Websoket
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*"
    }
});
io.on("connection", (socket) => {
    console.log("connexion effectué");
});
