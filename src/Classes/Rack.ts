import { Tile } from "./Tile";
import { TileBag } from "./TileBag"

export class Rack {
  private tileBag: TileBag;
  private tiles: Array<Tile> = [];
  private size: number = 7;
  constructor(tileBag: TileBag) {
    this.tileBag = tileBag
    this.firstDraw()
  }
  firstDraw() {
    const drawnTiles = this.tileBag.drawN(this.size)
    this.tiles.push(...drawnTiles);
  }
  getValue() {
    return this.tiles.reduce((acc, cur) => acc + cur.getValue(), 0)
  }
  pop() {
    return this.tiles.pop();
  }
  asDTO() {
    return {
      tileBag: this.tileBag.asDTO(),
      tiles: this.tiles.map(tile => tile.asDTO()),
      size: this.size
    };
  }

}