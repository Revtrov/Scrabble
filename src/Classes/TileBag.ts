import { Dictionary } from "./Dictionary";
import { Tile, TileElement } from "./Tile";

const vowels = new Set(["A", "E", "I", "O", "U"])

export class TileBag {
  private tiles: Array<Tile> = [];
  constructor() {
    const ELEMENT_COUNT = 30;
    const elements = Object.values(TileElement);
    const perElement = ELEMENT_COUNT / elements.length;

    const elementalPool = [];
    for (const el of elements) {
      for (let i = 0; i < perElement; i++) {
        elementalPool.push(el);
      }
    }

    for (let i = elementalPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [elementalPool[i], elementalPool[j]] = [elementalPool[j], elementalPool[i]];
    }

    for (const [letter, { count, points }] of Dictionary.getDistribution()) {
      for (let i = 0; i < count; i++) {
        if (elementalPool.length > 0) {
          const element = elementalPool.pop();
          this.tiles.push(new Tile(letter, points, element));
        } else {
          this.tiles.push(new Tile(letter, points));
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
