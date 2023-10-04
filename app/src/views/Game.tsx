import { Show, createSignal, onMount } from "solid-js";
import GameBoard, { turn, winnerIs } from "../components/GameView/GameBoard";
import { fieldFill } from "../components/GameView/GameState";

import { DefaultEventsMap } from "@socket.io/component-emitter";
import { Socket, io } from "socket.io-client";

let socket: Socket<DefaultEventsMap, DefaultEventsMap>;

if(window && window.location.href.includes("localhost")){
    socket = io("http://localhost:8000");
}else socket = io("http://puissance-4-api.lelu0920.odns.fr/");

export const [gameIsLunch, setGameIsLunch] = createSignal(true)

export default function(){
    onMount(() => {
        socket.on("connect", () => {
            console.log(socket.id); // x8WIv7-mJelg7on_ALbx
        });
    })

    return <section  class="flex flex-wrap w-full">
        <div class="w-[50vw] mx-auto">
            <Show when={winnerIs() != fieldFill.empty}>
                <p>Le gagnant est {winnerIs().toString()} </p>
            </Show>
            <p>Tour de: {turn()}</p>
            <GameBoard />
        </div>
    </section>
}