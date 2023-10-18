"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayersType = void 0;
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const roomManager_1 = __importDefault(require("./roomManager"));
const models_1 = require("./models");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.APP_PORT;
app.use((0, cors_1.default)());
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield models_1.User.create({
        name: "de",
        score: 1,
    });
    user.save();
    console.log(user.dataValues);
    const users = yield models_1.User.findAll();
    return res.status(200).json(users);
}));
const httpServer = new http_1.Server(app);
httpServer.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
// Websoket
const io = new socket_io_1.Server(httpServer, {
    cors: { origin: "*" },
});
var PlayersType;
(function (PlayersType) {
    PlayersType["player1"] = "1";
    PlayersType["player2"] = "2";
    PlayersType["ofPlayer"] = "0";
})(PlayersType || (exports.PlayersType = PlayersType = {}));
io.on("connection", (socket) => {
    // Will create room or append player to existing room
    socket.on("join-room", () => {
        let room = roomManager_1.default.getAvailableRoom(socket);
        let player = room.players.find((item) => item.id == socket.id);
        // * will be the  second player is joining the room if !Player
        if (!player) {
            player = roomManager_1.default.createPlayer(socket, false);
            roomManager_1.default.addPlayer(room.name, player);
            socket.join(room.name);
        }
        socket.emit("playerJoinedRoom", {
            room: roomManager_1.default.formatRoom(room),
            player,
        });
        socket
            .to(room.name)
            .emit("notification", "le " + player.name + " à rejoin le jeux");
    });
    socket.on("play", (data) => {
        let room = {};
        for (const roomName in roomManager_1.default.getRooms()) {
            if (roomManager_1.default.getRooms()[roomName]) {
                roomManager_1.default.getRooms()[roomName].players.map((player) => {
                    if (player.id == socket.id) {
                        room = roomManager_1.default.getRooms()[roomName];
                    }
                });
            }
        }
        let player = room.players.find((item) => item.id == socket.id);
        // * Check if room is not started if it is so start it
        if (!room.started)
            room.started = true;
        // * Check turn of
        if (room.turn == PlayersType.player1 && (player === null || player === void 0 ? void 0 : player.name) == PlayersType.player1)
            room.turn = PlayersType.player2;
        else if (room.turn == PlayersType.player2 &&
            (player === null || player === void 0 ? void 0 : player.name) == PlayersType.player2)
            room.turn = PlayersType.player1;
        room.grid = data.room.grid;
        // * update room
        room.winner = data.room.winner;
        roomManager_1.default.updateRoom(room);
        // * Emit event played to players
        socket
            .to(room.name)
            .emit("played", { col: data.col, room: roomManager_1.default.formatRoom(room) });
        socket.emit("played", { room: roomManager_1.default.formatRoom(room) });
    });
    socket.on("logRooms", () => {
        console.log("ROOMs:", roomManager_1.default.getRooms());
        socket.emit("logRooms", roomManager_1.default.getRoom(Array.from(socket.rooms)[1]));
    });
    // Gestion de l'événement 'leaveRoom' pour quitter la salle
    socket.on("leave-room", () => {
        const roomName = Array.from(socket.rooms)[1];
        const room = roomManager_1.default.getRoom(roomName);
        if (room) {
            const deleted = roomManager_1.default.removePlayerFromRoom(room.name, socket);
            if (deleted == "deleted")
                return;
            socket.leave(roomName);
        }
    });
});
