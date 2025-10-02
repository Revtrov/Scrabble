import { onDragMessage, Tile, tileMap } from '../Tile/Tile.js'

export class Square {
  constructor(_parentElement, _bonus) {
    this.parentElement = _parentElement
    this.bonus = _bonus
    this.fragment = document.createDocumentFragment()

    this.root = document.createElement('div')
    this.root.classList.add('Square')
    this.bonus && this.root.classList.add(this.bonus)
    this.tile;
    this.root.ondragover = (e) => {
      if (this.tile) return;
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
  placeTile(tile) {
    if (!(tile instanceof Tile))
      throw new TypeError('tile must be an instance of Tile')
    this.root.appendChild(tile.root)
  }
  onDrop(e) {
    if (!this.tile) {
      const tile = tileMap.get(e.dataTransfer.getData(onDragMessage))
      if(!tile) return; // silly chromium issues
      tile.parentElement.removeChild(tile.root)
      tile.parentElement = this.root
      tile.cell = this
      this.root.appendChild(tile.root)
      this.tile = tile;
      //this.root.classList.toggle("contains", true)
    }
  }
  onDragOver(e) {
    // console.log(this)
    if (!this.tile) {
      const tile = tileMap.get(e.dataTransfer.getData(onDragMessage))
      if(!tile) return; // silly chromium issues
      tile.parentElement.removeChild(tile.root)
      tile.parentElement = this.root
      this.root.appendChild(tile.root)
    }
  }
}
