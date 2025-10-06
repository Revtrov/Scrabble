import { onDragMessage, Tile, tileMap } from '../Tile/Tile.js'

export class Square {
  constructor(_parentElement, _bonus, _i, _j) {
    this.parentElement = _parentElement
    this.bonus = _bonus
    this.i = _i;
    this.j = _j;
    this.fragment = document.createDocumentFragment()

    this.root = document.createElement('div')
    this.root.classList.add('Square')
    this.bonus && this.root.classList.add(this.bonus)

    this.tile = null
    this.dragOverHighlight = false

    this.root.ondragover = (e) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      if (!this.dragOverHighlight) {
        this.root.classList.add('drag-over')
        this.dragOverHighlight = true
      }
    }

    this.root.ondragleave = (e) => {
      this.root.classList.remove('drag-over')
      this.dragOverHighlight = false
    }

    this.root.ondrop = (e) => {
      e.preventDefault()
      this.root.classList.remove('drag-over')
      this.dragOverHighlight = false
      if (!this.tile) {
        const tile = tileMap.get(e.dataTransfer.getData(onDragMessage))
        if (!tile) return
        if (tile.parentElement) {
          tile.parentElement.removeChild(tile.root)
          tile.parentElement.tile = null
        }
        tile.parentElement = this.root
        tile.cell = this
        this.root.appendChild(tile.root)
        this.tile = tile
      }
    }

    this.fragment.appendChild(this.root)
    this.parentElement.appendChild(this.fragment)
  }

  setTile(tileData) {
    this.root.innerHTML = ""
    this.tile = null
    if (tileData) {
      this.tile = new Tile(this.root, tileData)
    }
  }
  setBonus(bonus){
    this.bonus = bonus
this.root.className = "";
    this.root.classList.add('Square')
    this.root.classList.add(bonus)
  }
  setCoord(i, j){
    this.i = i;
    this.j = j
  }
  updateState(cellData){
    this.setBonus(cellData.bonus)
    this.setCoord(cellData.i, cellData.j)
    this.setTile(cellData.tile)
  }

  placeTile(tile) {
    if (!(tile instanceof Tile))
      throw new TypeError('tile must be an instance of Tile')
    this.root.appendChild(tile.root)
    this.tile = tile
    tile.cell = this
    tile.parentElement = this.root
  }
}
