import { DefaultEventsMap } from "@socket.io/component-emitter";
import { Socket, io } from "socket.io-client";

import { Show, createSignal, onCleanup, onMount } from "solid-js";
import GameBoard, { gameState } from "../components/GameView/GameBoard";
import { fieldFill } from "../components/GameView/game.utils";
import { getAvailableRoom, intialiseWebSocket, leaveRoomAndDisconnect } from "../services/web-socket.service";
import { GameModes, Player, gameMode, playerInformations } from "./Home";

let socketIO: Socket<DefaultEventsMap, DefaultEventsMap>;
if(window && window.location.href.includes("localhost")){
    socketIO = io("http://localhost:8000");
}else socketIO = io("http://puissance-4-api.lelu0920.odns.fr/");

export const socket = socketIO
export const [gameIsLunch, setGameIsLunch] = createSignal(true)

intialiseWebSocket(socket)


export interface Room {
    name: string;
    players: Player[];
    gameBoard: number[][];
    turnOf: 1 | 2;
    started?: boolean,
    winner?: null
  }

export function convertTurnOfNumberToField(turnOf: 1 | 2 | undefined | 0 | null): fieldFill{
    if(turnOf == 1) return fieldFill.player1
    else if(turnOf == 2) return fieldFill.player2
    else return fieldFill.empty
}
export default function(){
    onMount(() => {
        if(gameMode() == GameModes.vsPayer) socket.emit('join-room')
        // Écoutez l'événement 'beforeunload' pour déconnecter l'utilisateur lorsqu'il quitte la page
        window.addEventListener('beforeunload', () => leaveRoomAndDisconnect(socket));
    })

    onCleanup(() => leaveRoomAndDisconnect(socket))

    return <section>
        <p>Vous ête le {playerInformations()?.name}</p>
        <Show when={gameState().winner != fieldFill.empty}>
            <p>Le gagnant est {gameState().winner.toString()} </p>
        </Show>
        <p>Tour de: {gameState().turn()}</p>
        <GameBoard />
        <button onClick={() => getAvailableRoom(socket)}>log room</button>
    </section>
}