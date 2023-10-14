"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayersType = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const roomManager_1 = __importDefault(require("./roomManager"));
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
    cors: { origin: "*" }
});
var PlayersType;
(function (PlayersType) {
    PlayersType["player1"] = "1";
    PlayersType["player2"] = "2";
    PlayersType["ofPlayer"] = "0";
})(PlayersType || (exports.PlayersType = PlayersType = {}));
const rooms = {}; // Un objet pour stocker les salles
// Cette fonction renvoie la liste des salles disponibles
function getAvailableRooms() {
    let availableRooms;
    for (const roomName in rooms) {
        const room = rooms[roomName];
        if (room.players.length < 2) {
            availableRooms = room;
            break;
        }
    }
    return availableRooms;
}
;
// Créez une fonction pour gérer la création et la gestion des salles
const createRoom = () => {
    const roomName = `Room-${Object.keys(rooms).length + 1}`;
    rooms[roomName] = {
        name: roomName,
        players: [],
        grid: Array(6).fill(Array(7).fill(0)),
        turn: PlayersType.player1,
        lastPlayer: PlayersType.player1
    };
    return rooms[roomName];
};
io.on("connection", (socket) => {
    let currentRoom = null;
    function getPlayerBySocketID(id) {
        let player;
        for (const roomIndex in rooms) {
            const room = rooms[roomIndex];
            if (player != undefined)
                break;
            room.players.forEach((_player) => {
                if (_player.id == id) {
                    player = _player;
                }
            });
        }
        return player;
    }
    // Will create room or append player to existing room
    socket.on('join-room', () => {
        let room = roomManager_1.default.getAvailableRoom(socket);
        let player = room.players.find(item => item.id == socket.id);
        // * will be the  second player is joining the room if !Player
        if (!player) {
            player = roomManager_1.default.createPlayer(socket, false);
            roomManager_1.default.addPlayer(room.name, player);
            socket.join(room.name);
        }
        socket.emit('playerJoinedRoom', { room: roomManager_1.default.formatRoom(room), player });
        socket.to(room.name).emit("notification", "le " + player.name + " à rejoin le jeux");
    });
    socket.on('play', (col) => {
        let room = {};
        for (const roomName in roomManager_1.default.getRooms()) {
            if (roomManager_1.default.getRooms()[roomName]) {
                roomManager_1.default.getRooms()[roomName].players.map(player => {
                    if (player.id == socket.id) {
                        room = roomManager_1.default.getRooms()[roomName];
                    }
                });
            }
        }
        console.log("ROOM:", room);
        let player = room.players.find(item => item.id == socket.id);
        // * Check if room is not started if it is so start it  
        if (!room.started)
            room.started = true;
        // * Check turn of
        if (room.turn == PlayersType.player1 && (player === null || player === void 0 ? void 0 : player.name) == PlayersType.player1)
            room.turn = PlayersType.player2;
        else if (room.turn == PlayersType.player2 && (player === null || player === void 0 ? void 0 : player.name) == PlayersType.player2)
            room.turn = PlayersType.player1;
        // * set grid  of room
        console.log("ROOM AFTER TURNOF UPDATE", col);
        roomManager_1.default.updateRoom(room);
        // * Emit event played to players
        socket.to(room.name).emit('played', { col: col, room: roomManager_1.default.formatRoom(room) });
        socket.emit('played', { room: roomManager_1.default.formatRoom(room) });
    });
    socket.on('logRooms', () => socket.emit('logRooms', rooms));
    // Gestion de l'événement 'leaveRoom' pour quitter la salle
    socket.on('leave-room', () => {
        const roomName = Array.from(socket.rooms)[1];
        const room = roomManager_1.default.getRoom(roomName);
        if (room) {
            const deleted = roomManager_1.default.removePlayerFromRoom(room.name, socket);
            if (deleted == "deleted")
                return;
            socket.leave(roomName);
        }
    });
    // Logique du jeu Puissance 4
    socket.on('disconnect', () => {
        if (currentRoom && rooms[currentRoom]) {
            // Retirez le joueur de la salle lorsqu'il se déconnecte
            const room = rooms[currentRoom];
            const player = getPlayerBySocketID(String(socket.id));
            const playerIndex = room.players.indexOf(player);
            if (playerIndex !== -1) {
                room.players.splice(playerIndex, 1);
                io.to(currentRoom).emit('playerLeft');
                if (room.players.length === 0) {
                    // Supprimez la salle si elle est vide
                    delete rooms[currentRoom];
                }
            }
        }
    });
});
