import { Tile } from "./Tile";

export enum Bonus{
  TW = "TW",
  DW = "DW",
  TL = "TL",
  DL = "DL",
  START = "START",
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
  getBonus(){
    return this.bonus;
  }
  setBonus(bonus:Bonus){
    this.bonus = bonus;
  }
  getTile(): Tile | undefined {
    return this.tile;
  }
  setTile(tile: Tile) {
    if(this.tile) console.log("tile is being overwritten")
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