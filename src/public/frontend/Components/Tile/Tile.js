export const tileMap = new Map()
export const onDragMessage = "draggedTileId"
export class Tile {
  constructor(_parentElement, _data) {
    this.data = _data
    this.cell;
    if (!this.data.id) throw new Error('data.id should exist')
    tileMap.set(this.data.id, this)

    this.parentElement = _parentElement
    this.fragment = document.createDocumentFragment()

    this.root = document.createElement('div')
    this.root.classList.add('Tile')
    this.root.draggable = true
    this.root.ondragstart = (e) => this.onDrag(e)
    this.root.ondragend = (e) => this.onDragEnd(e)

    this.letter = document.createElement('div')
    if (!this.data.letter) throw new Error('data.letter should exist')
    this.letter.innerText = this.data.value == 0 ? " " : this.data.letter
    this.letter.classList.add('Letter')
    this.root.appendChild(this.letter)

    this.value = document.createElement('div')
    if (this.data.value == null) throw new Error('data.value should exist')
    this.value.innerText = this.data.value
    this.value.classList.add('Value')
    this.root.appendChild(this.value)

    this.fragment.appendChild(this.root)
    this.parentElement.appendChild(this.fragment)
  }
  onDrag(e) {
    if (this.cell) {
      this.cell.tile = null;
      //this.cell.root.classList.toggle("contains", false)
    }
    e.dataTransfer.setData(onDragMessage, this.data.id)
  }
  onDragEnd(e) {
  }
}
