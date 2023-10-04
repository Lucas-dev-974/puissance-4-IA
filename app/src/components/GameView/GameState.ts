import { createSignal } from "solid-js";
import { grid, setGrid, setTurn, turn } from "./GameBoard";

export enum fieldFill {
  empty = "0",
  player1 = "1",
  player2 = "2"
}

export const rowsCount = 6;
export const [lastPlayer, setLastPlayer] = createSignal<fieldFill>(fieldFill.player1)

function turnOf(){
  console.log(turn());
  
  const _turn = turn()
  if(turn() == fieldFill.player1) setTurn(fieldFill.player2)
  else setTurn(fieldFill.player1)
  return _turn
}

function updateGrid(row: number, col: number){
  setGrid((prev) => {
      const newArray = {...prev};
      newArray[row][col] = turnOf();
      return newArray
  })
}

function runLeftRight(row: number, col: number, count: number, left = true){
  let bufferCol: number;
  
  if(left) bufferCol = col - 1
  else bufferCol = col + 1
  
  while(grid()[row][bufferCol] == lastPlayer()){
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
  
  if(grid()[bufferRow] == undefined)
    return 0
  
  
  while(grid()[bufferRow] && grid()[bufferRow][col] == lastPlayer()){
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
  
  while(grid()[bufferRow] && grid()[bufferRow][bufferCol] == lastPlayer()){
      if(count >= 4) break
      
      if(left) bufferCol -=  1
      else bufferCol += 1
      
      if(bottom) bufferRow += 1
      else bufferRow -= 1
      
      count += 1
    }

  return count
}

export { diagCheck, horizontalCheck, runLeftRight, turnOf, updateGrid, verticalCheck };

