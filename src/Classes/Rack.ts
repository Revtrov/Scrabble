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
    this.addTiles(drawnTiles)
  }
  hasTileIds(tileIds: string[]) {
    return tileIds.every(tileId => this.tileIdMap.has(tileId));
  }
  exchangeByIds(tileIds: string[]) {
    const replacedTiles: Array<Tile> = this.tileBag.redrawTiles(tileIds.map(tileId => this.tileIdMap.get(tileId)));
    this.removeTilesById(tileIds);
    this.addTiles(replacedTiles);
  }
  fill() {
    const needed = this.size - this.tiles.length
    const drawnTiles: Tile[] = this.tileBag.drawN(needed);
    this.addTiles(drawnTiles)
  }
  addTiles(tiles: Tile[]) {
    this.tiles.push(...tiles);
    for (const tile of tiles) {
      this.tileIdMap.set(tile.getId(), tile);
    }
  }
  removeTiles(tiles: Tile[]) {
    for (const tile of tiles) {
      this.tileIdMap.delete(tile.getId());
      this.tiles = this.tiles.filter(tileEle => tileEle.getId() != tile.getId())
    }
  }
  removeTilesById(tileIds: string[]) {
    for (const id of tileIds) {
      this.tileIdMap.delete(id);
      this.tiles = this.tiles.filter(tileEle => tileEle.getId() != id)
    }
  }
  getValue() {
    return this.tiles.reduce((acc, cur) => acc + cur.getValue(), 0)
  }
  getTileIdMap(): Map<string, Tile> {
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