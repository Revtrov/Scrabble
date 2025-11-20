import { Dictionary } from "./Dictionary";
import { Tile, TileElement } from "./Tile";

const vowels = new Set(["A", "E", "I", "O", "U"])

export class TileBag {
  private tiles: Array<Tile> = [];
  constructor() {
    for (const [letter, { count, points }] of Dictionary.getDistribution().entries()) {
      for (let i = 0; i < count; i++) {
        const isElemental = Math.random() < 1;
        if (isElemental) {
          const possibleElements = Object.values(TileElement);
          const element = possibleElements[Math.floor(Math.random() * possibleElements.length)];
          this.tiles.push(new Tile(letter, points, element))
        } else {
          this.tiles.push(new Tile(letter, points))
        }
      }
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
    return Array.from({ length: Math.min(n, this.tiles.length) }, () => this.draw()!);
  }

  tilesRemaining(): number {
    return this.tiles.length;
  }
  asDTO() {
    return {
      remainingCount: this.tiles.length,
      vowelCount: this.tiles.filter(tile => vowels.has(tile.getLetter())).length,
      consonantCount: this.tiles.filter(tile => !vowels.has(tile.getLetter())).length
    }
  }
}
