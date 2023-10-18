import { DefaultEventsMap } from "@socket.io/component-emitter"
import { Socket, io } from "socket.io-client"

import { Show, createEffect, createSignal, onCleanup, onMount } from "solid-js"
import GameBoard, {
  GameState,
  GridType,
  InitialiseGameState,
  gameState,
  setGameState,
} from "../components/GameView/GameBoard"
import {
  getAvailableRoom,
  intialiseWebSocket,
  leaveRoomAndDisconnect,
} from "../services/web-socket.service"
import { GameModes, PlayersType, gameMode, playerInformations } from "./Home"

export const [socket, setSocket] =
  createSignal<Socket<DefaultEventsMap, DefaultEventsMap>>()

export interface RoomType {
  name: string
  started: boolean
  turn: PlayersType
  winner: PlayersType
  lastPlayer: PlayersType
  grid: { [key: number]: string[] }
}

export default function () {
  onMount(() => {
    switch (gameMode()) {
      case GameModes.local:
        break
      case GameModes.vsIA:
        break
      case GameModes.vsPayer:
        if (window && window.location.href.includes("localhost")) {
          setSocket(io("http://localhost:8000"))
        } else setSocket(io("http://puissance-4-api.lelu0920.odns.fr/"))
        intialiseWebSocket()
        socket()?.emit("join-room")
        break
    }

    if (gameMode() == GameModes.vsPayer) socket()?.emit("join-room")
    window.addEventListener("beforeunload", () => leaveRoomAndDisconnect())
  })

  onCleanup(() => {
    setGameState(InitialiseGameState())
    leaveRoomAndDisconnect()
  })

  return (
    <section class="game-content">
      <p>Vous ête le joueur {playerInformations()?.name}</p>
      <Show when={gameState().winner != PlayersType.ofPlayer}>
        <p>Le gagnant est le joueur {gameState().winner.toString()} </p>
      </Show>
      <p>Tour du joueur {gameState().turn}</p>
      <GameBoard />
      <button onClick={getAvailableRoom}>log room</button>
    </section>
  )
}
