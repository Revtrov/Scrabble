import { Player } from "../../Actors/Player.js";
import { api } from "../../Services/SessionManager.js";
import { onDragMessage, Tile, tileMap } from "../Tile/Tile.js";
export class Rack {
  constructor(_parentElement) {
    this.parentElement = _parentElement
    this.tiles = []
    this.tileIds = new Set();
    this.fragment = document.createDocumentFragment();

    this.root = document.createElement("div")
    this.root.classList.add("Rack")

    this.root.ondragover = (e) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      this.onDragOver(e)
    }
    this.root.ondragend = this.root.ondrop = (e) => {
      this.onDrop(e)
    }

    this.fragment.appendChild(this.root)
    this.parentElement.appendChild(this.fragment)
  }
  onDrop(e) {
    const tile = tileMap.get(e.dataTransfer.getData(onDragMessage));
    if (!tile) return;
    if (tile?.parentElement) tile.parentElement.removeChild(tile.root);
    tile.parentElement = this.root;
    tile.cell = null;
    this.root.appendChild(tile.root);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left);
    const section = Math.floor((x / (rect.right - rect.left)) * 7);


    const index = Math.max(0, Math.min(section, this.root.children.length));
    if (index >= this.root.children.length) {
      this.root.appendChild(tile.root);
    } else {
      this.root.insertBefore(tile.root, this.root.children[index]);
    }
  }
  onDragOver(e) {
    const tile = tileMap.get(e.dataTransfer.getData(onDragMessage));
    if (!tile) return;
    if (tile?.parentElement) tile.parentElement.removeChild(tile.root);
    tile.parentElement = this.root;
    tile.cell = null;
    this.root.appendChild(tile.root);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left);
    const section = Math.floor((x / (rect.right - rect.left)) * 7);


    const index = Math.max(0, Math.min(section, this.root.children.length));
    if (index >= this.root.children.length) {
      this.root.appendChild(tile.root);
    } else {
      this.root.insertBefore(tile.root, this.root.children[index]);
    }
  }

  setTiles(tiles) {
    this.tiles = []
    this.tileIds = new Set();
    for (const data of tiles) {
      this.tiles.push(new Tile(this.root, data, true))
      this.tileIds.add(data.id)
    }
  }

  async syncState(lobby) {
    // compare and update if different
    const res = await fetch(api + `/lobby/${lobby.id}/player/${Player.playerId}/rack`);
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
  getPlacedWord() {
    return this.tiles.filter(tile => tile.cell);
  }

}