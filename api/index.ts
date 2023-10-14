import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
import { Server as HTTPServer } from 'http';
import { Server } from 'socket.io';
import roomManager from './roomManager';

dotenv.config();

const app: Express = express();
const port = process.env.APP_PORT;

app.get('/', (req: Request, res: Response) => {
  res.send("l'application puissance 4 API est en cour de de construction, teste 1");
});

const httpServer = new HTTPServer(app)
httpServer.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
})

// Websoket
const io = new Server(httpServer, {
  cors:{ origin: "*" }
});

export enum PlayersType {
  player1 = "1",
  player2 = "2",
  ofPlayer = "0"
}

export type TokenType = {
  token: string
}

export type PlayerType = {
  id: string;
  pseudo: string;
  name: PlayersType; // Todo: convert to playerType
  token: TokenType
}

export interface RoomType {
  grid: { [key: number]: string[] };
  winner?: PlayersType;
  lastPlayer: PlayersType;
  turn:  PlayersType;
  started?: boolean;

  name: string;
  players: PlayerType[];
}

const rooms: Record<string, RoomType> = {}; // Un objet pour stocker les salles

// Cette fonction renvoie la liste des salles disponibles
function getAvailableRooms(){
  let availableRooms: RoomType  | undefined;

  for (const roomName in rooms) {
    const room = rooms[roomName];
    if (room.players.length < 2) {
      availableRooms = room
      break
    }
  }
  return availableRooms as RoomType;
};

// Créez une fonction pour gérer la création et la gestion des salles
const createRoom = () => {
  const roomName = `Room-${Object.keys(rooms).length + 1}`;
  rooms[roomName] = {
    name: roomName,
    players: [], // Ajoutez le joueur créateur à la liste des joueurs
    grid: Array(6).fill(Array(7).fill(0)),
    turn: PlayersType.player1,
    lastPlayer: PlayersType.player1
  };
  
  return rooms[roomName];
}

io.on("connection", (socket) => {
  let currentRoom: string | null = null;
  
  function getPlayerBySocketID(id: string){
    let player: PlayerType | undefined;
    
    for(const roomIndex in rooms){
      const room = rooms[roomIndex]
      if(player != undefined) break

      room.players.forEach((_player) => {
        if(_player.id == id){ 
          player = _player
        }
      });
    }

    return player
  }

  // Will create room or append player to existing room
  socket.on('join-room', () => {
    let room: RoomType = roomManager.getAvailableRoom(socket);
    let player: PlayerType | undefined = room.players.find(item => item.id == socket.id) 
    
    // * will be the  second player is joining the room if !Player
    if(!player){
      player = roomManager.createPlayer(socket, false)
      roomManager.addPlayer(room.name, player)
      socket.join(room.name)
    }
    
    socket.emit('playerJoinedRoom',  {room: roomManager.formatRoom(room), player})
    socket.to(room.name).emit("notification",  "le " + player.name + " à rejoin le jeux")  
  });

  socket.on('play', (col: number) => {
    let room: RoomType = {} as RoomType;

    for(const roomName in roomManager.getRooms()){
      if(roomManager.getRooms()[roomName]){
        roomManager.getRooms()[roomName].players.map(player => {
          if(player.id == socket.id){
            room = roomManager.getRooms()[roomName]
          }
        })
      }
    }


    console.log("ROOM:", room);
    

    let player: PlayerType | undefined = room.players.find(item => item.id == socket.id) 
    
    // * Check if room is not started if it is so start it  
    if(!room.started) room.started = true

    
    // * Check turn of
    if(room.turn == PlayersType.player1 && player?.name == PlayersType.player1) room.turn = PlayersType.player2
    else if(room.turn == PlayersType.player2 && player?.name == PlayersType.player2) room.turn = PlayersType.player1

    // * set grid  of room
    
    console.log("ROOM AFTER TURNOF UPDATE", col);

    roomManager.updateRoom(room)
    // * Emit event played to players
    socket.to(room.name).emit('played', {col: col, room: roomManager.formatRoom(room)})
    socket.emit('played', {room:  roomManager.formatRoom(room)})
  })

  socket.on('logRooms', () => socket.emit('logRooms', rooms))
  
  // Gestion de l'événement 'leaveRoom' pour quitter la salle
  socket.on('leave-room', () => {
    const roomName = Array.from(socket.rooms)[1]
    const room = roomManager.getRoom(roomName)
    if(room){
      const deleted = roomManager.removePlayerFromRoom(room.name, socket)
      if(deleted == "deleted") return
      socket.leave(roomName)
    }
  });

  // Logique du jeu Puissance 4
  socket.on('disconnect', () => {
    if (currentRoom && rooms[currentRoom]) {
      // Retirez le joueur de la salle lorsqu'il se déconnecte
      const room = rooms[currentRoom];
      const player = getPlayerBySocketID(String(socket.id))
      const playerIndex = room.players.indexOf(player as PlayerType);
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