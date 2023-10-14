"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
class RoomManager {
    constructor() {
        this.rooms = {};
    }
    static getInstance() {
        if (RoomManager.instance === null) {
            RoomManager.instance = new RoomManager();
        }
        return RoomManager.instance;
    }
    createPlayer(socket, first = true) {
        return {
            id: String(socket.id),
            name: first ? _1.PlayersType.player1 : _1.PlayersType.player2,
            pseudo: "pseudo",
            token: {
                token: socket.id
            }
        };
    }
    addPlayer(roomName, player) {
        if (this.rooms[roomName].players.length < 2) {
            this.rooms[roomName].players.push(player);
        }
    }
    createRoom(socket) {
        const roomName = `Room-${Object.keys(this.rooms).length + 1}`;
        this.rooms[roomName] = {
            name: roomName,
            players: [this.createPlayer(socket)],
            grid: Array(6).fill(Array(7).fill(0)),
            turn: _1.PlayersType.player1,
            lastPlayer: _1.PlayersType.player1
        };
        socket.join(roomName);
        return this.rooms[roomName];
    }
    getAvailableRoom(socket) {
        let availableRooms = {};
        for (const roomName in this.rooms) {
            const room = this.rooms[roomName];
            if (room.players.length < 2) {
                availableRooms = room;
                break;
            }
        }
        if (Object.keys(availableRooms).length == 0)
            return this.createRoom(socket);
        return availableRooms;
    }
    getRoom(roomName) {
        return this.rooms[roomName];
    }
    getPlayerOfRoom(socket) {
        const roomName = Array.from(socket.rooms)[1];
        const room = this.getRoom(roomName);
        if (!room)
            return undefined;
        return room.players.find(item => item.id == socket.id);
    }
    formatRoom(room) {
        return {
            grid: room.grid,
            lastPlayer: room.lastPlayer,
            turn: room.turn,
            started: room.started,
            winner: room.winner
        };
    }
    updateRoom(room) {
        this.rooms[room.name] = room;
    }
    getRooms() {
        return this.rooms;
    }
    removePlayerFromRoom(roomName, socket) {
        if (this.rooms[roomName]) {
            const room = this.rooms[roomName];
            const playerIndex = room.players.findIndex(item => item.id == socket.id);
            this.rooms[roomName].players.splice(playerIndex, 1);
            console.log("player left");
            socket.to(room.name).emit('player-left', socket.id); // Informez les autres joueurs
            // Supprimez la salle si elle est vide
            if (room.players.length === 0 || room.started) {
                console.log("REMOVE room");
                delete this.rooms[room.name];
                if (room.started) {
                    socket.to(room.name).emit('exit-game');
                }
                return "deleted";
            }
        }
    }
}
RoomManager.instance = null;
exports.default = RoomManager.getInstance();
