import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { PlayerType, PlayersType, RoomType } from ".";

class RoomManager {
    private static instance: RoomManager | null = null;
    public rooms: Record<string, RoomType> = {};

    public static getInstance(): RoomManager {
        if (RoomManager.instance === null) {
            RoomManager.instance = new RoomManager();
        }
        return RoomManager.instance;
    }
    
    public createPlayer(socket: any, first = true): PlayerType{
        return {
            id: String(socket.id),
            name: first ? PlayersType.player1 : PlayersType.player2,
            pseudo: "pseudo",
            token: {
                token: socket.id
            }
        }
    }

    public addPlayer(roomName: string, player:  PlayerType){
        if(this.rooms[roomName].players.length < 2){
            this.rooms[roomName].players.push(player)
        }
    }

    public createRoom(socket: any): RoomType{
        const roomName = `Room-${Object.keys(this.rooms).length + 1}`;
        this.rooms[roomName] = {
          name: roomName,
          players: [this.createPlayer(socket)],
          grid: Array(6).fill(Array(7).fill(0)),
          turn: PlayersType.player1,
          lastPlayer: PlayersType.player1
        };
        socket.join(roomName)
        return this.rooms[roomName];
    }

    public getAvailableRoom(socket: any): RoomType {
        let availableRooms: RoomType = {} as RoomType;

        for (const roomName in this.rooms) {
          const room = this.rooms[roomName];
          if (room.players.length < 2) {
            availableRooms = room
            break
          }
        }
        if(Object.keys(availableRooms).length == 0) return this.createRoom(socket)
        return availableRooms;
    }

    public getRoom(roomName: string): RoomType{
        return this.rooms[roomName]
    } 

    public getPlayerOfRoom(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>){
        const roomName = Array.from(socket.rooms)[1]
        const room = this.getRoom(roomName)
        if(!room) return undefined
        return room.players.find(item => item.id == socket.id)
    }

    public formatRoom(room: RoomType): parsedRoom{
        return {
            grid: room.grid,
            lastPlayer: room.lastPlayer,
            turn: room.turn,
            started: room.started,
            winner: room.winner
        }
    }

    public updateRoom(room: RoomType){
        this.rooms[room.name] = room
    }

    public getRooms(){
        return this.rooms
    }
    
    public removePlayerFromRoom(roomName: string, socket: any){
        if (this.rooms[roomName]) {
            const room = this.rooms[roomName]
            const playerIndex = room.players.findIndex(item => item.id == socket.id)
            this.rooms[roomName].players.splice(playerIndex, 1);
            console.log("player left");
            
            socket.to(room.name).emit('player-left', socket.id); // Informez les autres joueurs

            // Supprimez la salle si elle est vide
            if (room.players.length === 0 || room.started) {
                console.log("REMOVE room");
                delete this.rooms[room.name];

                if(room.started) {
                    socket.to(room.name).emit('exit-game')
                }
                return "deleted"
            }
        }
      }
}
type parsedRoom =  Omit<RoomType, "players" | "name">

export default RoomManager.getInstance()