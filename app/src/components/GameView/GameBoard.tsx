import { Accessor, For, Setter, createSignal } from "solid-js";
import { socket } from "../../views/Game";
import { PlayeNames, convertPlayerToFieldFill } from "../../views/Home";
import "./GameBoard.css";
import { checkwin, fieldFill, rowsCount, setLastPlayer, updateGrid } from "./game.utils";

type GridType = { [key: number]: fieldFill[] }


export type GameState = {
    player?: PlayeNames,
    grid: Accessor<{ [key: number]: string[] }>, 
    setGrid: Setter<{ [key: number]: string[] }>,
    turn: Accessor<fieldFill>,
    setTurn: Setter<fieldFill>,
    winner: fieldFill,
    lastPlayer: fieldFill,
    started: boolean
}


function InitialiseGameState(): GameState{
    const [turn, setTurn] = createSignal<fieldFill>(fieldFill.player1)
    const [grid, setGrid] = createSignal< { [key: number]: string[] }>([])
    
    const initalGameState = {
        grid: grid, 
        setGrid: setGrid,
        turn: turn,
        setTurn: setTurn,
        winner: fieldFill.empty,
        lastPlayer: fieldFill.player1,
        started: false
    }
    
    
    const initialGrid: GridType = {}
    for (let row = 0; row <= rowsCount; row++) {
        initialGrid[row] = [fieldFill.empty,fieldFill.empty,fieldFill.empty,fieldFill.empty,fieldFill.empty,fieldFill.empty]
    }
    initalGameState.setGrid(initialGrid)
    initalGameState.setTurn(fieldFill.player1)
    
    return initalGameState
}

export const [gameState, setGameState] = createSignal<GameState>(InitialiseGameState())
export default function (){
    function placeDisc(col: number){
        socket.emit('play')
        let posed = false
        if(gameState().winner != fieldFill.empty) return 
        
        if(convertPlayerToFieldFill(gameState().player as PlayeNames) != gameState().turn()) return console.log('not your tower')
        for(const _row of Object.keys(gameState().grid()).reverse()){
            const row = Number(_row)
            
            const position =gameState().grid()[row][col] 
            if(!posed) {
                if(position == "0"){
                    setLastPlayer(gameState().turn() as fieldFill)
                    updateGrid(row, col)
                    checkwin(row, col)
                    posed = true    
                }
            }
        }
    }
    
    function getGridAsOneArray(){
        const bufferGrid = []
        
        const rows = 7
        const cols = 6

        
        for(let row = 0; row < rows; row++){
            for(let _col = 0; _col <= cols; _col++){
                if(!bufferGrid[_col]) bufferGrid[_col] = []
                // ! warning ts-ignore
                // @ts-ignore
                bufferGrid[_col].push(gameState().grid()[row][_col])
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
            <For each={Object.keys(gameState().grid())}>{(row) =>
                <div class="row">
                    <For each={gameState().grid()[Number(row)]}>
                        {(square, index) => <div class="square" classList={{
                            "red-square": square == fieldFill.player1,
                            "blue-square": square == fieldFill.player2 
                        }} onClick={(event: Event) => placeDisc(index())} />}
                    </For>
                </div>
            }</For>
        </div>
    </>
}