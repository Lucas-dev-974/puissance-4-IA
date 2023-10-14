import { PlayersType } from "../../views/Home";
import { gameState, setDisplayGrid, setGameState } from "./GameBoard";

export const rowsCount = 6;

function updateTurnOf(turn: PlayersType){
  setGameState(prev => {
    if(prev != undefined){
      const state = prev
      state.lastPlayer = state.turn
      state.turn = turn
      return state
    }
    return  prev
  })
}

function turnOf(){
  const _turn = gameState().turn
  if(gameState().turn == PlayersType.player1)  updateTurnOf(PlayersType.player2)
  else updateTurnOf(PlayersType.player1)
  return _turn.toString()
}

function updateGrid(row: number, col: number){
  setGameState(prev => {
    if(prev == undefined) return prev 
    prev.grid[row][col] = turnOf()
    return prev
  })
  setDisplayGrid(prev => {
    if(prev == undefined) return prev
    return gameState().grid
  })
}

function runLeftRight(row: number, col: number, count: number, left = true){
  let bufferCol: number;
  
  if(left) bufferCol = col - 1
  else bufferCol = col + 1
  
  while(gameState().grid[row][bufferCol] == gameState().lastPlayer.toString()){
      if(count >= 4) break
      count += 1
      if(left) bufferCol -=  1
      else bufferCol += 1
  }

  return count
}

function horizontalCheck(row: number, col: number){
  const leftCount = runLeftRight(row, col, 0)
  const rightCount = runLeftRight(row, col, 0, false)

  const leftRightCount = leftCount + rightCount + 1  
  return leftRightCount
}

function verticalCheck(row: number, col: number){
  let count = runVertical(row, col, 0)
  if(count < 4) count = 0
  return count
}

function runVertical(row: number, col: number, count: number){
  let bufferRow: number = row
  
  if(gameState().grid[bufferRow] == undefined)
    return 0
  
  
  while(gameState().grid[bufferRow] && gameState().grid[bufferRow][col] == gameState().lastPlayer.toString()){
    if(count >= 4) break
    count += 1
    bufferRow +=  1
  }

  return count
}

function diagCheck(row: number, col: number){
  let count: number = 0

  let bottomLeftCount = runDiag(row, col, count)
  const rightTopCount = runDiag(row, col, count, false, false)  
  
  let topLeftCount = runDiag(row, col, count, true, false)  
  let rightBottomcount = runDiag(row, col, count, false, true)  

  let topLeftRightBottomDiag = topLeftCount + rightBottomcount 
  let bottomLeftRightTopDiag = bottomLeftCount + rightTopCount
  
  if(topLeftRightBottomDiag > 0) topLeftRightBottomDiag += 1
  if(bottomLeftRightTopDiag > 0) bottomLeftRightTopDiag += 1
  
  if(topLeftRightBottomDiag >= 4) return topLeftRightBottomDiag
  if(bottomLeftRightTopDiag >= 4) return bottomLeftRightTopDiag
  
  return count
}

function runDiag(row: number, col: number, count: number, left = true, bottom = true){
  let bufferCol: number;
  let bufferRow: number;

  if(left) bufferCol = col - 1
  else bufferCol = col + 1

  if(bottom) bufferRow = row + 1
  else bufferRow = row - 1
  
  while(gameState().grid[bufferRow] && gameState().grid[bufferRow][bufferCol] == gameState().lastPlayer.toString()){
      if(count >= 4) break
      
      if(left) bufferCol -=  1
      else bufferCol += 1
      
      if(bottom) bufferRow += 1
      else bufferRow -= 1
      
      count += 1
    }

  return count
}

export function checkwin(row: number, col: number){
  let count: number;
  count = horizontalCheck(row, col)
  
  count = count >= 4 ? count : verticalCheck(row, col)
  count = count >= 4 ? count : diagCheck(row, col)
  console.log("checkwin count:", count, gameState().grid);
  
  if(count >= 4) {
      setGameState((prev) => {
          if(prev != undefined){
              const state = {...prev}
              state.winner = gameState().lastPlayer
              return state
          }
          return prev
      })
      console.log("gameState Winner:", gameState());
      
      return console.log("win of ", gameState().lastPlayer);
  }
}
export { diagCheck, horizontalCheck, runLeftRight, turnOf, updateGrid, verticalCheck };

