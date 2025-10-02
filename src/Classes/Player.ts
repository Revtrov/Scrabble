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
  constructor(tileBag: TileBag, lobby: Lobby) {
    this.tileBag = tileBag;
    this.rack = new Rack(this.tileBag);
    this.lobby = lobby;
  }
  getRack(): Rack {
    return this.rack;
  }
  getId():string{
    return this.id;
  }
  // placePiece(tile:Tile, i:number, j:number){
  //   this.lobby.placePiece(this, tile, i, j);
  // }
  asDTO(){
    return {
      id:this.id
    }
  }
}