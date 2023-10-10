import { DefaultEventsMap } from "@socket.io/component-emitter";
import { Socket } from "socket.io-client";
import { setGameState } from "../components/GameView/GameBoard";
import { Room, convertTurnOfNumberToField } from "../views/Game";
import { Player, setPlayerInformaitons } from "../views/Home";

export function intialiseWebSocket(socket: Socket<DefaultEventsMap, DefaultEventsMap>){
    socket.on('notification', (notif) => {
        console.log(notif);
        
    })
    socket.on('playerJoinedRoom', (data: {room: Room, player: Player}) => {
        console.log("joined room", data.room);
        setPlayerInformaitons(data.player)
        setGameState((prev) => {
            if(prev != undefined){
                const state = {...prev}
                state.player = data.player.name
                return state
            }
            return prev
        })
    })
    
    socket.on('player-left', () => {
        console.log("player as leaved the game");
    })
    
    
    socket.on('played', (room: Room) => {
        console.log("played");
        console.log(room);
        
        setGameState((prev) => {
            if(prev != undefined){
                const state = prev
                state.setTurn(convertTurnOfNumberToField(room.turnOf))
                return state
            }

            return prev
        })
    })
    
    socket.on('exit-game', () => {
        console.log("game exited");
        
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