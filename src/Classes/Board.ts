import { Cell } from "./Cell";
import { Lobby } from "./Lobby";
import { Player } from "./Player";
import { Tile } from "./Tile";

enum MoveOutcome{
  InvalidIndex,
  AlreadyOccupied,
  Placed
}

export class Board {
  private lobby: Lobby;
  private grid: Cell[][];
  private sideLength: number = 15;
  constructor(lobby:Lobby) {
    this.lobby = lobby;
    this.grid = Array.from({ length: this.sideLength }, (_, j) => {
      return Array.from({ length: this.sideLength }, (_, i) => {
        return new Cell(i, j);
      })
    })
  }
  placePiece(player:Player, tile:Tile, i:number, j:number){
    if(!this.grid?.[j]?.[i]) return MoveOutcome.InvalidIndex;
    if(this.grid[j][i].getTile()){
      return MoveOutcome.AlreadyOccupied;
    }else{
      this.grid[j][i].setTile(tile);
      return MoveOutcome.Placed;
    }
  }
  print(){
    let gridStr = ""
    for(const row of this.grid){
      let rowStr = ""
      for(const col of row){
        rowStr+=col.toString()
      }
      rowStr+="\n"
      gridStr+=rowStr
    }
  }
}
