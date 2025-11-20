import { Coord } from "./services/GameManager";
import { Tile } from "./Tile";

export enum Bonus {
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
  private bonus: Bonus
  constructor(i: number, j: number, bonus: Bonus) {
    this.i = i;
    this.j = j;
    this.bonus = bonus
  }
  getCoord() {
    return { i: this.i, j: this.j } as Coord;
  }
  getBonus() {
    return this.bonus;
  }
  setBonus(bonus: Bonus) {
    this.bonus = bonus;
  }
  getTile(): Tile | undefined {
    return this.tile;
  }
  setTile(tile: Tile | null) {
    this.tile = tile ?? undefined;
  }

  toString() {
    return `[${this.tile ? this.tile.getLetter() : " "}]`
  }
  asDTO() {
    return {
      i: this.i,
      j: this.j,
      bonus: this.bonus,
      tile: this.tile?.asDTO()
    }
  }
}