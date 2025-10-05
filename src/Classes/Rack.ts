import { Tile } from "./Tile";
import { TileBag } from "./TileBag"

export class Rack {
  private tileBag: TileBag;
  private tiles: Array<Tile> = [];
  private tileIdMap: Map<string, Tile> = new Map();
  private size: number = 7;
  constructor(tileBag: TileBag) {
    this.tileBag = tileBag
    this.firstDraw()
  }
  firstDraw() {
    const drawnTiles: Tile[] = this.tileBag.drawN(this.size)
    this.tiles.push(...drawnTiles);
    for (const tile of drawnTiles) {
      this.tileIdMap.set(tile.getId(), tile);
    }
  }
  hasTileIds(tileIds:string[]){
    return tileIds.every(tileId=>this.tileIdMap.has(tileId));
  }
  exchange(){

  }
  fill(){

  }
  getValue() {
    return this.tiles.reduce((acc, cur) => acc + cur.getValue(), 0)
  }
  getTileIdMap():Map<string, Tile>{
    return this.tileIdMap;
  }
  asDTO() {
    return {
      tileBag: this.tileBag.asDTO(),
      tiles: this.tiles.map(tile => tile.asDTO()),
      size: this.size
    };
  }

}