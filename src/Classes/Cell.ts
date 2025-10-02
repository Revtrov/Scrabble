import { Tile } from "./Tile";

export class Cell {
  private i: number;
  private j: number;
  private tile?: Tile;
  constructor(i: number, j: number) {
    this.i = i;
    this.j = j;
  }
  getTile():Tile|undefined{
    return this.tile;
  }
  setTile(tile: Tile){
    this.tile = tile;
  }
  toString(){
    return `[${this.tile?this.tile.getLetter(): " "}]`
  }
}