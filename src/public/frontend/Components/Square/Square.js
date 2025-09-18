import { Tile } from "../Tile/Tile.js";

export class Square {
  constructor(_parentElement) {
    this.parentElement = _parentElement;
    this.fragment = document.createDocumentFragment();

    this.root = document.createElement("div");
    this.root.classList.add("Square")
    this.root.ondragover = (ev) => {
      ev.preventDefault();
      ev.dataTransfer.dropEffect = "move";
      this.root.classList.toggle("Hovered", true)
    };
    this.root.ondragleave = (ev) => {
      this.root.classList.toggle("Hovered", false)
    };

    this.root.ondrop = (ev) => {
      this.root.classList.toggle("Hovered", false)
    };

    this.fragment.appendChild(this.root)
    this.parentElement.appendChild(this.fragment)
  }
  placeTile(tile) {
    if (!(tile instanceof Tile)) throw new TypeError("tile must be an instance of Tile")
    this.root.appendChild(tile.root)
  }
}