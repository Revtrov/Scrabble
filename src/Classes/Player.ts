import { Lobby } from "./Lobby";
import { Rack } from "./Rack";
import { Tile } from "./Tile";
import { TileBag } from "./TileBag";
import { v4 as uuid4 } from "uuid";

export class Player {
  private tileBag: TileBag;
  private lobby: Lobby;
  private rack: Rack;
  private id: string = uuid4();
  private score: number;
  constructor(lobby: Lobby) {
    this.lobby = lobby;
    this.score = 0;
  }
  setRack(rack: Rack) {
    this.rack = rack;
  }
  addScore(score: number) {
    this.score += score;
  }
  getScore(){
    return this.score;
  }
  getRack(): Rack {
    return this.rack;
  }
  getId(): string {
    return this.id;
  }
  asDTO() {
    return {
      id: this.id,
      score:this.score
    };
  }
}
