import { v4 as uuid4 } from "uuid";
export enum TileElement {
  Earth = "Earth",
  Wind = "Wind",
  Water = "Water",
  Fire = "Fire"
}
export class Tile {
  private letter: string;
  private value: number;
  private id: string = uuid4();
  private element?: TileElement;
  constructor(letter: string, value: number, element?: TileElement) {
    this.letter = letter;
    this.value = value;
    this.element = element;
  }
  getElement(): TileElement | undefined {
    return this.element;
  }
  setElement(element: TileElement) {
    this.element = element
  }
  getValue(): number {
    return this.value
  }
  getLetter(): string {
    return this.letter
  }
  getId(): string {
    return this.id;
  }
  fromDTO({ letter }): never {
    // letters value from dict
    throw new Error("Tile.fromDTO Not implemented")
  }
  asDTO() {
    return {
      letter: this.letter,
      value: this.value,
      id: this.id,
      element: this.element
    }
  }
}

export class BlankTile extends Tile {
  constructor(letter: string, value: number, element?: TileElement) {
    super(letter, value, element);
  }
}
