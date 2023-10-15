import { DefaultEventsMap } from "@socket.io/component-emitter";
import { Socket, io } from "socket.io-client";

import { Show, createEffect, createSignal, onCleanup, onMount } from "solid-js";
import GameBoard, { gameState } from "../components/GameView/GameBoard";
import { getAvailableRoom, intialiseWebSocket, leaveRoomAndDisconnect } from "../services/web-socket.service";
import { GameModes, PlayersType, gameMode, playerInformations } from "./Home";

let socketIO: Socket<DefaultEventsMap, DefaultEventsMap>;
if(window && window.location.href.includes("localhost")){
    socketIO = io("http://localhost:8000");
}else socketIO = io("http://puissance-4-api.lelu0920.odns.fr/");

export const socket = socketIO
export const [gameIsLunch, setGameIsLunch] = createSignal(true)

intialiseWebSocket(socket)

export interface Room {
    name: string;
    started: boolean
    turn: PlayersType;
    winner: PlayersType
    lastPlayer: PlayersType;
    grid: { [key: number]: string[] };
  }


export default function(){
    createEffect(() => {
        console.log("room", gameState());
    })
    onMount(() => {
        if(gameMode() == GameModes.vsPayer) socket.emit('join-room')
        window.addEventListener('beforeunload', () => leaveRoomAndDisconnect(socket));
        
        
    })

    onCleanup(() => leaveRoomAndDisconnect(socket))

    return <section>
        <p>Vous ête le joueur {playerInformations()?.name}</p>
        <Show when={gameState().winner != PlayersType.ofPlayer}>
            <p>Le gagnant est le joueur 2 {gameState().winner.toString()} </p>
        </Show>
        <p>Tour du joueur {gameState().turn}</p>
        <GameBoard />
        <button onClick={() => getAvailableRoom(socket)}>log room</button>
    </section>
}