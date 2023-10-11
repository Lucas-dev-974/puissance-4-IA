import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
import { Server as HTTPServer } from 'http';
import { Server } from 'socket.io';

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

enum Players {
  player1 = "joueur 1",
  player2 = "joueur 2",
  ofPlayer = ""
}

interface Player {
  id: string;
  name: string;
}

interface Room {
  name: string;
  players: Player[];
  grid: { [key: number]: string[] };
  turnOf: Players;
  winner?: null;
  started?: false | boolean;
}

const rooms: Record<string, Room> = {}; // Un objet pour stocker les salles

// Cette fonction renvoie la liste des salles disponibles
function getAvailableRooms(){
  let availableRooms: Room | null | undefined = null

  for (const roomName in rooms) {
    const room = rooms[roomName];
    if (room.players.length < 2) {
      availableRooms = room
      break
    }
  }
  return availableRooms as Room;
};

// Créez une fonction pour gérer la création et la gestion des salles
const createRoom = () => {
  const roomName = `Room-${Object.keys(rooms).length + 1}`;
  rooms[roomName] = {
    name: roomName,
    players: [], // Ajoutez le joueur créateur à la liste des joueurs
    grid: Array(6).fill(Array(7).fill(0)),
    turnOf: Players.player1
  };
  
  return rooms[roomName];
}

io.on("connection", (socket) => {
  let currentRoom: string | null = null;
  
  function getPlayerBySocketID(id: string){
    let player: Player | undefined;
    
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

  function removePlayerFromRoom(room: Room, playerIndex: number){
    if (playerIndex !== -1) {
      room.players.splice(playerIndex, 1);
      io.to(room.name).emit('player-left', socket.id); // Informez les autres joueurs
    }
  }
  // Will create room or append player to existing room
  socket.on('join-room', () => {
    console.log("join room");
    
    let room: Room | null  | undefined;
    room = getAvailableRooms()
    let player: Player = {
      id: String(socket.id),
      name: Players.ofPlayer
    };
    
    if(!room){
      player.name = Players.player1
      room = createRoom()
    }else if(room.players[0].name == Players.player1){
      player.name = Players.player2
    }else if(room.players[0].name == Players.player2){
      player.name = Players.player1
    }
    
    room.players.push(player);
    socket.join(room.name)
    
    if(room.players.length == 1){
      socket.emit('playerJoinedRoom',  {room, player})
    }else{
      socket.emit('playerJoinedRoom',  {room, player})
      socket.emit('notification',  'Vous avez rejoin une parti, vous ête le joueur ' + player.name)
      socket.to(room.name).emit("notification",  "le " + player.name + " à rejoin le jeux")  
    }
    
  });

  socket.on('play', (grid: { [key: number]: string[] }) => {
    const roomName  = Array.from(socket.rooms)[1]
    const room = rooms[roomName]

    // * Get player by socket
    const player = room.players.filter(player => player.id == socket.id)[0]
    
    // * Check if room is not started if it is so start it  
    if(!room.started) room.started = true

    console.log(player, room.turnOf == Players.player1 && player.name == Players.player1);
    
    // * Check turn of
    if(room.turnOf == Players.player1 && player.name == Players.player1) room.turnOf = Players.player2
    else if(room.turnOf == Players.player2 && player.name == Players.player2) room.turnOf = Players.player1

    // * set grid  of room
    room.grid = grid

    // * Emit event played to players
    socket.to(roomName).emit('played', room)
    socket.emit('played', room)
  })

  socket.on('logRooms', () => socket.emit('logRooms', rooms))
  
  // Gestion de l'événement 'leaveRoom' pour quitter la salle
  socket.on('leave-room', () => {
    const roomName = Array.from(socket.rooms)[1]

    if(roomName){
      socket.leave(roomName)  
      const room = rooms[roomName]
      
      if(room){
        const player = getPlayerBySocketID(String(socket.id))
        const playerIndex = room.players.indexOf(player as Player);

        removePlayerFromRoom(room, playerIndex)
        
        // Supprimez la salle si elle est vide
        if (room.players.length === 0 || room.started) {
          if(room.started) io.to(room.name).emit('exit-game')
          delete rooms[room.name];
          return
        }

        // if(room.players[0].name == "joueur 1")
        
        if(room.started){
          delete rooms[room.name];
          console.log('default started game of room', roomName, room.started);
          io.to(roomName).emit("player-left")
          return
        }
      }
    }

    // if (currentRoom) {
    //   socket.leave(currentRoom); // Quittez la salle
      
    //   const room = rooms[currentRoom];
      
      
    //   if (room) {
    //     const player = getPlayerBySocketID(String(socket.id))
    //     const playerIndex = room.players.indexOf(player as Player);
        
    //     if (playerIndex !== -1) {
    //       room.players.splice(playerIndex, 1);
    //       io.to(currentRoom).emit('playerLeft', socket.id); // Informez les autres joueurs
    //       if (room.players.length === 0) {
            // Supprimez la salle si elle est vide
    //         delete rooms[currentRoom];
    //       }
    //     }
    //   }
    //   currentRoom = null; // Réinitialisez la salle actuelle de l'utilisateur
    // }
  });

  // Logique du jeu Puissance 4
  socket.on('disconnect', () => {
    if (currentRoom && rooms[currentRoom]) {
      // Retirez le joueur de la salle lorsqu'il se déconnecte
      const room = rooms[currentRoom];
      const player = getPlayerBySocketID(String(socket.id))
      const playerIndex = room.players.indexOf(player as Player);
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