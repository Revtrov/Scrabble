import { Cell } from "./Cell";
import { Lobby } from "./Lobby";
import { Player } from "./Player";
import { Coord, Direction } from "./services/GameManager";
import { Tile } from "./Tile";

enum MoveOutcome {
  InvalidIndex,
  AlreadyOccupied,
  Placed
}

export class Board {
  private grid: Cell[][];
  private sideLength: number = 15;
  constructor() {
    this.grid = Array.from({ length: this.sideLength }, (_, j) => {
      return Array.from({ length: this.sideLength }, (_, i) => {
        return new Cell(i, j);
      })
    })
  }
  asDTO(){
    return this.grid.map(row=>row.map((cell:Cell)=>cell.asDTO()))
  }
  placeWord(direction: Direction, startIndex: Coord, tiles: Tile[]) {
    switch (direction) {
      case Direction.Horizontal:
        for (let j = startIndex.j; j < startIndex.j + tiles.length; j++) {
          this.grid[startIndex.i][j].setTile(tiles[j - startIndex.j]);
        }
        break;
      case Direction.Vertical:
        for (let i = startIndex.i; i < startIndex.i + tiles.length; i++) {
          this.grid[i][startIndex.j].setTile(tiles[i - startIndex.i]);
        }
        break;
    }
  }
  print() {
    let gridStr = ""
    for (const row of this.grid) {
      let rowStr = ""
      for (const col of row) {
        rowStr += col.toString()
      }
      rowStr += "\n"
      gridStr += rowStr
    }
    console.log(gridStr)
  }
}
