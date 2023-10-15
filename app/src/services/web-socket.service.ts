import { DefaultEventsMap } from "@socket.io/component-emitter";
import { Socket } from "socket.io-client";
import { placeDisc, setGameState } from "../components/GameView/GameBoard";
import { Room } from "../views/Game";
import { Player, setPlayerInformaitons } from "../views/Home";

export function intialiseWebSocket(socket: Socket<DefaultEventsMap, DefaultEventsMap>){
    socket.on('notification', (notif) => {
        console.log(notif);  
    })

    socket.on('playerJoinedRoom', (data: {room: Room, player: Player}) => {
        setPlayerInformaitons(data.player)
        setGameState((prev) => {
            if(prev != undefined){
                const state = {...prev}
                state.player = data.player.name
                state.turn = data.room.turn
                state.lastPlayer = data.room.lastPlayer
                state.started = data.room.started
                state.winner = data.room.winner
                state.grid = data.room.grid
                return state
            }
            return prev
        })
    })
    
    socket.on('player-left', () => {
        alert("player as leaved the game")
    })
    
    
    socket.on('played', (data:{ col?: number, room: Room }) => {
        if(data.col !=  undefined) placeDisc(data.col, true, false) 
        setGameState((prev) => {
            if(prev == undefined) return prev
            const state = {...prev}
            state.turn = data.room.turn
            state.lastPlayer = data.room.lastPlayer
            state.winner = data.room.winner
            return state
        })
    })
    
    socket.on('exit-game', () => {
        alert("désoler le joueur qui joue contre vous à quiter la partie !")
    })
}

// Fonction pour quitter la salle et déconnecter le socket
export function leaveRoomAndDisconnect(socket: Socket<DefaultEventsMap, DefaultEventsMap>){
    socket.emit('leave-room'); // Émettez un événement pour quitter la salle côté serveur
    socket.disconnect(); // Déconnectez le socket
};

export function getAvailableRoom(socket: Socket<DefaultEventsMap, DefaultEventsMap>){
    socket.emit('logRooms');
    socket.on('logRooms', (room: Room) => {
        console.log("availableRooms:", room);
    });
}