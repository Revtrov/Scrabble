export const tileMap = new Map();
export class Tile {
  constructor(_parentElement, _data) {
    this.data = _data;

    this.parentElement = _parentElement
    this.fragment = document.createDocumentFragment()

    this.root = document.createElement("div")
    this.root.classList.add("Tile")
    this.root.draggable = true
    this.root.ondrag = (e)=>this.onDrag(e)

    this.letter = document.createElement("div")
    if (!this.data.letter) throw new Error("data.letter should exist");
    this.letter.innerText = this.data.letter;
    this.letter.classList.add("Letter")
    this.root.appendChild(this.letter)

    this.value = document.createElement("div")
    if (!this.data.value) throw new Error("data.value should exist");
    this.value.innerText = this.data.value;
    this.value.classList.add("Value")
    this.root.appendChild(this.value)

    this.fragment.appendChild(this.root)
    this.parentElement.appendChild(this.fragment)
  }
  onDrag(e){
    e.dataTransfer.dropEffect = "move"
  }
}