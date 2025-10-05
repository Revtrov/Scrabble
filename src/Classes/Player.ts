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
  constructor(lobby: Lobby) {
    this.lobby = lobby;
  }
  setRack(rack:Rack){
    this.rack = rack
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