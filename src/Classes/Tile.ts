import { v4 as uuid4 } from "uuid";
export class Tile {
  private letter: string;
  private value: number;
  private id: string = uuid4();
  constructor(letter: string, value: number) {
    this.letter = letter;
    this.value = value;
  }
  getValue(): number {
    return this.value
  }
  getLetter(): string {
    return this.letter
  }
  getId():string{
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
      id:this.id
    }
  }
}