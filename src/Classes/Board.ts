import z from "zod";
import { Bonus, Cell } from "./Cell";
import { Coord, Direction, TilePlacementSchema } from "./services/GameManager";
import { Tile } from "./Tile";

export class Board {
  private grid: Cell[][];
  private sideLength: number = 19;
  private startIndex = { i: Math.floor(this.sideLength/2), j: Math.floor(this.sideLength/2) };
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

    function applySymmetry(i: number, j: number, sideLength: number) {
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
    this.grid[this.startIndex.i][this.startIndex.i].setBonus(Bonus.START);
  }
  getCell(i: number, j: number): Cell {
    return this.grid[i][j];
  }
  getStartIndex() {
    return this.startIndex;
  }
  isInBounds(i: number, j: number): boolean {
    return i < this.sideLength && j < this.sideLength && i > 0 && j > 0;
  }
  asDTO() {
    return {
      grid: this.grid.map(row => row.map((cell: Cell) => cell.asDTO())),
      sideLength: this.sideLength
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
  placeTiles( tiles: Tile[], moveDataTiles: z.infer<typeof TilePlacementSchema>[]) {
    for (let k = 0; k < tiles.length; k++) {
      const tile = tiles[k];
      const placement = moveDataTiles[k];
      const { i, j } = placement;

      if (this.grid[i][j].getTile()) {
        throw new Error(`Cannot place tile at (${i}, ${j}): cell already occupied`);
      }
  
      this.grid[i][j].setTile(tile);
    }
  }
  
  unPlaceWord(direction: Direction, startIndex: Coord, tiles: Tile[]) {
    switch (direction) {
      case Direction.Horizontal:
        for (let j = startIndex.j; j < startIndex.j + tiles.length; j++) {
          this.grid[startIndex.i][j].setTile(null);
        }
        break;
      case Direction.Vertical:
        for (let i = startIndex.i; i < startIndex.i + tiles.length; i++) {
          this.grid[i][startIndex.j].setTile(null);
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
