import { For, createSignal, onMount } from "solid-js"
import Game, { socket } from "../../views/Game"
import {
  GameModes,
  PlayersType,
  gameMode,
  playerInformations,
  setPlayerInformaitons,
} from "../../views/Home"
import "./GameBoard.css"
import { checkwin, rowsCount, turnOf, updateGrid } from "./game.utils"

import * as synaptic from "synaptic"
import modele from "../../models/ia-normal.json"

export type GridType = { [key: number]: string[] }

export type Token = {
  token: string
}

type gridType = { [key: number]: string[] }
export type GameState = {
  grid: gridType
  player?: PlayersType
  players?: {}
  turn: PlayersType
  winner: PlayersType
  lastPlayer: PlayersType
  started: boolean
}
export function InitialiseGameState(): GameState {
  const initialGrid: GridType = {}
  for (let row = 0; row <= rowsCount; row++) {
    const playerOf = PlayersType.ofPlayer.toString()
    initialGrid[row] = [
      playerOf,
      playerOf,
      playerOf,
      playerOf,
      playerOf,
      playerOf,
    ]
  }

  const initalGameState = {
    grid: initialGrid,
    turn: PlayersType.player1,
    winner: PlayersType.ofPlayer,
    lastPlayer: PlayersType.ofPlayer,
    started: false,
  }
  return initalGameState
}
export const [gameState, setGameState] = createSignal<GameState>(
  InitialiseGameState()
)

let robot = synaptic.Network.fromJSON(modele)
// console.log(robot)

/**
 *
 * @example
 * // returns 0 ou 1 ou 2 ou 3 ou 4 ou 5
 * entierAleatoire(0, 5);
 */
function entierAleatoire(minimum: number, maximum: number) {
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum
}

function grille(grid: any) {
  let grille = []

  for (const indexLigne in grid) {
    let ligne = grid[indexLigne].map((element: string) => {
      return parseInt(element)
    })
    grille.push(ligne)
  }

  return grille
}

function get1DArrayFormatted(
  playerId: number,
  grille: Array<Array<number>>
): Array<number> {
  return grille.reduce(
    (array, line) =>
      array.concat(
        line.map((cellValue) => {
          if (cellValue === 0) return 0
          else if (cellValue === playerId) return 1
          else return -1
        })
      ),
    []
  )
}

export function placeDisc(
  col: number,
  byPassTurnOf = false,
  emit = true,
  humainJoue = true
) {
  let posed = false
  if (gameState().winner != PlayersType.ofPlayer) return

  const canIPlay =
    playerInformations()?.name.toString() == gameState().turn.toString()
  if (!canIPlay && (byPassTurnOf == false || gameMode() == GameModes.local))
    return alert("Ce n'est pas votre tour")

  for (const _row of Object.keys(gameState().grid).reverse()) {
    const row = Number(_row)
    const position = gameState().grid[row][col]
    if (!posed && position == "0") {
      updateGrid(row, col)

      turnOf()

      checkwin(row, col)
      posed = true
    }
  }

  if (emit && gameMode() != GameModes.local)
    socket()?.emit("play", { col: col, room: gameState() })

  // le joueur joue une partie contre l'IA && le joueur vient de placer un jeton,...
  if (gameMode() == GameModes.vsIA && humainJoue == true) {
    let output = robot.activate(
      get1DArrayFormatted(2, grille(gameState().grid))
    )

    let indexColonne = output.indexOf(Math.max(...output))

    // ...c'est donc au tour de l'IA de jouer
    placeDisc(indexColonne, false, true, false)
  }
}

export default function () {
  function getGridAsOneArray() {
    const bufferGrid = []
    const rows = 7
    const cols = 6

    for (let row = 0; row < rows; row++) {
      for (let _col = 0; _col <= cols; _col++) {
        if (!bufferGrid[_col]) bufferGrid[_col] = []
        // ! warning ts-ignore
        // @ts-ignore
        bufferGrid[_col].push(gameState().grid[row][_col])
      }
    }

    let returnArray: string[] = []

    // ! remove undefined rows
    for (const arr of bufferGrid) {
      if (arr[0] != undefined) returnArray = [...returnArray, ...arr]
    }

    return returnArray
  }

  onMount(() => {
    if (gameMode() == GameModes.local || gameMode() == GameModes.vsIA)
      setPlayerInformaitons({
        id: PlayersType.player1,
        name: PlayersType.player1,
        token: { token: "" },
      })
  })

  return (
    <div class="game-board">
      <For each={Object.keys(gameState().grid)}>
        {(row) => (
          <div class="row">
            <For each={gameState().grid[Number(row)]}>
              {(square, index) => (
                <div
                  class="square"
                  classList={{
                    "red-square": square == PlayersType.player1.toString(),
                    "blue-square": square == PlayersType.player2.toString(),
                  }}
                  onClick={() => placeDisc(index())}
                ></div>
              )}
            </For>
          </div>
        )}
      </For>
    </div>
  )
}
