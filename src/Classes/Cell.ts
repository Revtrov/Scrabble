import { Tile } from "./Tile";

export enum Bonus{
  TW = "TW",
  DW = "DW",
  TL = "TL",
  DL = "DL"
}

export class Cell {
  private i: number;
  private j: number;
  private tile?: Tile;
  private bonus:Bonus
  constructor(i: number, j: number, bonus:Bonus) {
    this.i = i;
    this.j = j;
    this.bonus = bonus
  }
  getTile(): Tile | undefined {
    return this.tile;
  }
  setTile(tile: Tile) {
    this.tile = tile;
  }
  toString() {
    return `[${this.tile ? this.tile.getLetter() : " "}]`
  }
  asDTO(){
    return{
      i:this.i,
      j:this.j,
      bonus:this.bonus,
      tile:this.tile?.asDTO()
    }
  }
}