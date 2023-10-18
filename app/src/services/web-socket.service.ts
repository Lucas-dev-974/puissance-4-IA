import { DefaultEventsMap } from "@socket.io/component-emitter"
import { Socket } from "socket.io-client"
import { placeDisc, setGameState } from "../components/GameView/GameBoard"
import { RoomType, socket } from "../views/Game"
import {
  GameModes,
  Player,
  gameMode,
  setPlayerInformaitons,
} from "../views/Home"

export function intialiseWebSocket() {
  socket()?.on("notification", (notif) => {
    console.log(notif)
  })

  socket()?.on(
    "playerJoinedRoom",
    (data: { room: RoomType; player: Player }) => {
      console.log("playerJoinedRoom", data)

      setPlayerInformaitons(data.player)
      setGameState((prev) => {
        if (prev != undefined) {
          const state = { ...prev }
          state.player = data.player.name
          state.started = data.room.started

          if (gameMode() == GameModes.local) {
            state.turn = data.room.turn
            state.grid = data.room.grid
            state.winner = data.room.winner
            state.lastPlayer = data.room.lastPlayer
          }

          return state
        }
        return prev
      })
    }
  )

  socket()?.on("player-left", () => {
    alert("player as leaved the game")
  })

  socket()?.on("played", (data: { col?: number; room: RoomType }) => {
    if (data.col != undefined) placeDisc(data.col, true, false)
    if (gameMode() == GameModes.local) return

    setGameState((prev) => {
      if (prev == undefined) return prev
      const state = { ...prev }
      state.turn = data.room.turn
      state.lastPlayer = data.room.lastPlayer
      state.winner = data.room.winner
      return state
    })
  })

  socket()?.on("exit-game", () => {
    alert("désoler le joueur qui joue contre vous à quiter la partie !")
  })
}

// Fonction pour quitter la salle et déconnecter le socket()
export function leaveRoomAndDisconnect() {
  socket()?.emit("leave-room") // Émettez un événement pour quitter la salle côté serveur
  socket()?.disconnect() // Déconnectez le socket()
}

export function getAvailableRoom() {
  socket()?.emit("logRooms")
  socket()?.on("logRooms", (room: RoomType) => {
    console.log("availableRooms:", room)
  })
}
