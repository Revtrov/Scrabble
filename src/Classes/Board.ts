import { Bonus, Cell } from "./Cell";
import { Coord, Direction } from "./services/GameManager";
import { Tile } from "./Tile";

export class Board {
  private grid: Cell[][];
  private sideLength: number = 15;
  private startIndex = { i: 2, j: 2 };
  constructor() {
    const bonuses = {
      "0,0": Bonus.TW, "0,3": Bonus.DL, "0,7": Bonus.TW,
      "1,1": Bonus.DW, "1,5": Bonus.TL,
      "2,2": Bonus.DW, "2,6": Bonus.DL,
      "3,0": Bonus.DL, "3,3": Bonus.DW, "3,7": Bonus.DL,
      "4,4": Bonus.DW,
      "5,1": Bonus.TL, "5,5": Bonus.TL,
      "6,2": Bonus.DL, "6,6": Bonus.DL,
      "7,0": Bonus.TW, "7,3": Bonus.DL, "7,7": Bonus.DW
    };

    function applySymmetry(i:number, j:number, sideLength:number) {
      const last = sideLength - 1;
      return [
        [i, j],
        [last - i, j],
        [i, last - j],
        [last - i, last - j]
      ];
    }

    this.grid = Array.from({ length: this.sideLength }, (_, i) => {
      return Array.from({ length: this.sideLength }, (_, j) => {
        let bonus = null;
        for (const [coord, type] of Object.entries(bonuses)) {
          const [x, y] = coord.split(",").map(Number);
          for (const [xi, yj] of applySymmetry(x, y, this.sideLength)) {
            if (xi === i && yj === j) {
              bonus = type;
              break;
            }
          }
          if (bonus) break;
        }
        return new Cell(i, j, bonus);
      });
    });
  }
  getStartIndex() {
    return this.startIndex;
  }
  asDTO() {
    return {
      grid:this.grid.map(row => row.map((cell: Cell) => cell.asDTO())),
      sideLength:this.sideLength
    }
  }
  placeWord(direction: Direction, startIndex: Coord, tiles: Tile[]) {
    // need to return failure on trying to place word on other word.
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
