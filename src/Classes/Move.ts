import { Tile } from "./Tile";

enum Direction {
  Vertical,
  Horizontal
}

interface MoveDTO {
  wordString: string,
  direction: string,
  location: Array<number>
}

export class Move {
  private word: Array<Tile>;

  fromDTO({ wordString, direction, location }: MoveDTO) {

  }

}