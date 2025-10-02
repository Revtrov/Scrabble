import { api, SessionManager } from "../../Services/SessionManager.js";
import { Tile } from "../Tile/Tile.js";
export class Rack {
  constructor(_parentElement) {
    this.player;
    this.parentElement = _parentElement
    this.tiles = []
    this.tileIds = new Set();
    this.fragment = document.createDocumentFragment();

    this.root = document.createElement("div")
    this.root.classList.add("Rack")

    this.fragment.appendChild(this.root)
    this.parentElement.appendChild(this.fragment)
  }

  setTiles(tiles) {
    this.tiles = []
    this.tileIds = new Set();
    for (const data of tiles) {
      this.tiles.push(new Tile(this.root, data))
      this.tileIds.add(data.id)
    }
  }

  async syncState(lobby) {
    // compare and update if different
    const res = await fetch(api + `/lobby/${lobby.id}/player/${this.player.playerId}/rack`);
    if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    const serverRack = await res.json();
    if (serverRack.error) throw new Error(`Rack request failed: ${serverRack.error}`);
    if (!serverRack.tiles || !serverRack.tiles.length) throw new Error(`Rack contained no tiles: ${serverRack.error}`);
    const serverRackIds = new Set(serverRack.tiles.map(tile => tile.id))
    console.log(serverRack)
    if (this.tileIds != serverRackIds) {
      this.setTiles(serverRack.tiles)
    }
  }

}