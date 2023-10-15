import { For, createSignal } from "solid-js";
import { socket } from "../../views/Game";
import { PlayersType, playerInformations } from "../../views/Home";
import "./GameBoard.css";
import { checkwin, rowsCount, updateGrid } from "./game.utils";

export type GridType = { [key: number]: string[] }

export type Token = {
    token: string
}

type gridType = { [key: number]: string[] }
export type GameState = {
    grid: gridType, 
    player?: PlayersType,
    players?: {},
    turn: PlayersType,
    winner: PlayersType,
    lastPlayer: PlayersType,
    started: boolean
}


function InitialiseGameState(): GameState{
    const initialGrid: GridType = {}
    for (let row = 0; row <= rowsCount; row++) {
        const playerOf = PlayersType.ofPlayer.toString()
        initialGrid[row] = [playerOf,playerOf,playerOf,playerOf,playerOf,playerOf]
    }
    

    const initalGameState = {
        grid: initialGrid,
        turn: PlayersType.player1,
        winner: PlayersType.ofPlayer,
        lastPlayer: PlayersType.ofPlayer,
        started: false
    }
    return initalGameState
}

export const [gameState, setGameState] = createSignal<GameState>(InitialiseGameState())


export function placeDisc(col: number, byPassTurnOf = false, emit = true){
    let posed = false
    if(gameState().winner != PlayersType.ofPlayer) return 

    const canIPlay = playerInformations()?.name == gameState().turn
    if(!canIPlay && byPassTurnOf == false) return alert("Ce n'est pas votre tour")
    
    for(const _row of Object.keys(gameState().grid).reverse()){
        const row = Number(_row)
        const position = gameState().grid[row][col]
        if(!posed && position == "0") {
            updateGrid(row, col)
            checkwin(row, col)
            posed = true   
        }
    }
    if(emit) socket.emit('play', {col: col, room: gameState()})
}

export default function (){ 
    function getGridAsOneArray(){
        const bufferGrid = []        
        const rows = 7
        const cols = 6

        for(let row = 0; row < rows; row++){
            for(let _col = 0; _col <= cols; _col++){
                if(!bufferGrid[_col]) bufferGrid[_col] = []
                // ! warning ts-ignore
                // @ts-ignore
                bufferGrid[_col].push(gameState().grid[row][_col])
            }
        }

        let returnArray: string[] = []
        
        // ! remove undefined rows
        for(const arr of bufferGrid){
            if(arr[0] != undefined) returnArray = [...returnArray, ...arr]            
        }
        
        return returnArray
    }
    
    return <>
         <div class="game-board"> 
            <For each={Object.keys(gameState().grid)}>{(row) =>
                <div class="row">
                    <For each={gameState().grid[Number(row)]}>
                        {(square, index) => <div class="square" classList={{
                            "red-square": square == PlayersType.player1.toString(),
                            "blue-square": square == PlayersType.player2.toString() 
                        }} onClick={() => placeDisc(index())} >{ square }</div>}
                    </For>
                </div>
            }</For>
        </div>
    </>
}