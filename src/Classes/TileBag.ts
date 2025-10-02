import { Dictionary } from "./Dictionary";
import { Tile } from "./Tile";


export class TileBag {
  private tiles: Array<Tile> = [];
  constructor() {
    for (const [letter, { count, points }] of Dictionary.getDistribution().entries()) {
      this.tiles.push(new Tile(letter, points))
    }
    this.shuffle();
  }

  private shuffle() {
    for (let i = this.tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.tiles[i], this.tiles[j]] = [this.tiles[j], this.tiles[i]];
    }
  }

  redrawTiles(discarded: Array<Tile>): Array<Tile> {
    this.tiles.push(...discarded)
    this.shuffle();
    return Array.from({ length: discarded.length }, () => this.draw()!);
  }

  draw(): Tile | undefined {
    return this.tiles.pop();
  }

  drawN(n: number): Tile[] | [] {
    return Array.from({ length: n }, () => this.draw()!);
  }

  tilesRemaining(): number {
    return this.tiles.length;
  }
  asDTO(){
    return {
      tiles:this.tiles.map(tile=>tile.asDTO()),
    }
  }
}
