import { Board } from "../Board";
import { Bonus, Cell } from "../Cell";
import { Tile } from "../Tile";
import { Coord, Direction } from "./GameManager";

export default class ScoringEngine {
  board:Board;
  constructor(board:Board) {
    this.board = board;
  }

  public scoreWord(startIndex: Coord, direction: Direction, tiles: Tile[]): number {
    let wordMultiplier = 1;
    let score = 0;

    for (let k = 0; k < tiles.length; k++) {
      const tile = tiles[k];

      const i = startIndex.i + (direction === Direction.Vertical ? k : 0);
      const j = startIndex.j + (direction === Direction.Horizontal ? k : 0);

      const cell: Cell | undefined = this.board.getCell(i, j);
      if (!cell) continue;

      let tileScore = tile.getValue();

      // Apply letter bonus only for newly placed tiles
      switch (cell.getBonus()) {
        case Bonus.DL:
          tileScore *= 2;
          break;
        case Bonus.TL:
          tileScore *= 3;
          break;
        case Bonus.DW || Bonus.START:
          wordMultiplier *= 2;
          break;
        case Bonus.TW:
          wordMultiplier *= 3;
          break;
      }

      score += tileScore;
    }

    return score * wordMultiplier;
  }
}
