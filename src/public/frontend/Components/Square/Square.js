import { onDragMessage, Tile, tileMap } from '../Tile/Tile.js'

export class Square {
  constructor(_parentElement) {
    this.parentElement = _parentElement
    this.fragment = document.createDocumentFragment()

    this.root = document.createElement('div')
    this.root.classList.add('Square')
    this.root.ondragover = (e) => {
      e.preventDefault() 
      e.dataTransfer.dropEffect = 'move'
      this.onDragOver(e)
    }
    this.root.ondragenter = (e) => {
      this.root.classList.toggle('Hovered', true)
    }
    this.root.ondragleave = (e) => {
      this.root.classList.toggle('Hovered', false)
    }
    this.root.ondrop = (e) => {
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
    const tile = tileMap.get(e.dataTransfer.getData(onDragMessage))
    tile.parentElement.removeChild(tile.root)
    tile.parentElement = this.root
    this.root.appendChild(tile.root)
  }
  onDragOver(e) {
    const tile = tileMap.get(e.dataTransfer.getData(onDragMessage))
    tile.parentElement.removeChild(tile.root)
    tile.parentElement = this.root
    this.root.appendChild(tile.root)
  }
}
