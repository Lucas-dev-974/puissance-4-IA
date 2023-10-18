import cors from "cors";
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import { Server as HTTPServer } from "http";
import { Server } from "socket.io";
import roomManager from "./roomManager";
import { User } from "./models";

dotenv.config();

const app: Express = express();
const port = process.env.APP_PORT;

app.use(cors());
app.get("/", async (req: Request, res: Response) => {
  const user = await User.create({
    name: "de",
    score: 1,
  });
  user.save();
  console.log(user.dataValues);

  const users = await User.findAll();
  return res.status(200).json(users);
});

const httpServer = new HTTPServer(app);
httpServer.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

// Websoket
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

export enum PlayersType {
  player1 = "1",
  player2 = "2",
  ofPlayer = "0",
}

export type TokenType = {
  token: string;
};

export type PlayerType = {
  id: string;
  pseudo: string;
  name: PlayersType; // Todo: convert to playerType
  token: TokenType;
};

type GridType = { [key: number]: string[] };
export interface RoomType {
  grid: GridType;
  winner?: PlayersType;
  lastPlayer: PlayersType;
  turn: PlayersType;
  started?: boolean;

  name: string;
  players: PlayerType[];
}

io.on("connection", (socket) => {
  // Will create room or append player to existing room
  socket.on("join-room", () => {
    let room: RoomType = roomManager.getAvailableRoom(socket);
    let player: PlayerType | undefined = room.players.find(
      (item) => item.id == socket.id
    );

    // * will be the  second player is joining the room if !Player
    if (!player) {
      player = roomManager.createPlayer(socket, false);
      roomManager.addPlayer(room.name, player);
      socket.join(room.name);
    }

    socket.emit("playerJoinedRoom", {
      room: roomManager.formatRoom(room),
      player,
    });
    socket
      .to(room.name)
      .emit("notification", "le " + player.name + " à rejoin le jeux");
  });

  socket.on("play", (data: { col: number; room: RoomType }) => {
    let room: RoomType = {} as RoomType;

    for (const roomName in roomManager.getRooms()) {
      if (roomManager.getRooms()[roomName]) {
        roomManager.getRooms()[roomName].players.map((player) => {
          if (player.id == socket.id) {
            room = roomManager.getRooms()[roomName];
          }
        });
      }
    }

    let player: PlayerType | undefined = room.players.find(
      (item) => item.id == socket.id
    );

    // * Check if room is not started if it is so start it
    if (!room.started) room.started = true;

    // * Check turn of
    if (room.turn == PlayersType.player1 && player?.name == PlayersType.player1)
      room.turn = PlayersType.player2;
    else if (
      room.turn == PlayersType.player2 &&
      player?.name == PlayersType.player2
    )
      room.turn = PlayersType.player1;
    room.grid = data.room.grid;
    // * update room

    room.winner = data.room.winner;
    roomManager.updateRoom(room);
    // * Emit event played to players
    socket
      .to(room.name)
      .emit("played", { col: data.col, room: roomManager.formatRoom(room) });
    socket.emit("played", { room: roomManager.formatRoom(room) });
  });

  socket.on("logRooms", () => {
    console.log("ROOMs:", roomManager.getRooms());

    socket.emit("logRooms", roomManager.getRoom(Array.from(socket.rooms)[1]));
  });

  // Gestion de l'événement 'leaveRoom' pour quitter la salle
  socket.on("leave-room", () => {
    const roomName = Array.from(socket.rooms)[1];
    const room = roomManager.getRoom(roomName);
    if (room) {
      const deleted = roomManager.removePlayerFromRoom(room.name, socket);
      if (deleted == "deleted") return;
      socket.leave(roomName);
    }
  });
});
