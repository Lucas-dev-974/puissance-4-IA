import { Show, createSignal } from "solid-js"
import GameBoard, { turn, winnerIs } from "../components/GameView/GameBoard"
import { fieldFill } from "../components/GameView/GameState"

export const [gameIsLunch, setGameIsLunch] = createSignal(true)

export default function(){
    return <section  class="flex flex-wrap w-full">
        <div class="w-[80%] mx-auto">
            <Show when={winnerIs() != fieldFill.empty}>
                <p>Le gagnant est {winnerIs().toString()} </p>
            </Show>
            <p>Tour de: {turn()}</p>
            <GameBoard />
        </div>
    </section>
}