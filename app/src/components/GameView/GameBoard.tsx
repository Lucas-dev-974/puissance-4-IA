import { For, createSignal } from "solid-js";
import "./GameBoard.css";
import { diagCheck, fieldFill, horizontalCheck, lastPlayer, rowsCount, setLastPlayer, updateGrid, verticalCheck } from "./GameState";

type BoardType = { [key: number]: fieldFill[] }

export const [turn, setTurn] = createSignal<fieldFill>(fieldFill.player1)
export const [grid, setGrid] = createSignal< { [key: number]: string[] }>({})
export const [winnerIs, setWinnerIs] = createSignal<fieldFill>(fieldFill.empty)

export default function (){
    const initialBoard: BoardType = {}
    for (let row = 0; row <= rowsCount; row++) {
        initialBoard[row] = [fieldFill.empty,fieldFill.empty,fieldFill.empty,fieldFill.empty,fieldFill.empty,fieldFill.empty,fieldFill.empty]
    }
    
    setGrid(initialBoard)
        
    function checkwin(row: number, col: number){
        let count: number;
        count = horizontalCheck(row, col)
        console.log("horinzontal count",count );
        
        count = count >= 4 ? count : verticalCheck(row, col)
        count = count >= 4 ? count : diagCheck(row, col)
        
        if(count >= 4) {
            setWinnerIs(lastPlayer)
            return console.log("win of ", lastPlayer());
        }
    }

    function placeDisc(col: number){        
        let posed = false

        if(winnerIs() != fieldFill.empty) return 
        
        for(const _row of Object.keys(grid()).reverse()){
            const row = Number(_row)
            
            const position = grid()[row][col] 
            if(!posed) {
                if(position == "0"){
                    setLastPlayer(turn() as fieldFill)
                    updateGrid(row, col)
                    checkwin(row, col)
                    posed = true    
                }
            }
        }
    }
    
    return <div class="game-board"> 
        <For each={Object.keys(grid())}>{(row) =>
            <div class="row">
                <For each={grid()[Number(row)]}>
                    {(square, index) => <div class="square" classList={{
                        "red-square": square == fieldFill.player1,
                        "blue-square": square == fieldFill.player2 
                    }} onClick={(event: Event) => placeDisc(index())} />}
                </For>
            </div>
        }</For>
    </div>
}