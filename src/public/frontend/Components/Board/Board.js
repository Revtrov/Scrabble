import { Square } from "../Square/Square.js";
import { Tile } from "../Tile/Tile.js";

export class Board {
  constructor(_parentElement, _sideLength) {
    if(!_sideLength) throw new Error("Board must have side length")
    this.sideLength = _sideLength

    this.parentElement = _parentElement;
    this.fragment = document.createDocumentFragment();

    this.root = document.createElement("div");
    this.root.classList.add("Board");

    this.squareGrid = new Array();
    this.squareContainer = document.createElement("div");
    this.squareContainer.classList.add("SquareContainer")
    this.squareContainerFragment = document.createDocumentFragment();

    for (let i = 0; i < this.sideLength; i++) {
      this.squareGrid.push([])
      for (let j = 0; j < this.sideLength; j++) {
        this.squareGrid[i].push(new Square(this.squareContainerFragment))
      }
    }
    const testTile = new Tile(this.squareGrid[0][0].root, {letter:"A", value:"1"})

    this.squareContainer.appendChild(this.squareContainerFragment)
    this.root.appendChild(this.squareContainer)

    this.title = document.createElement("div");
    this.title.textContent = "SCROBBLE"
    this.title.classList.add("Title")
    this.root.appendChild(this.title)

    this.fragment.appendChild(this.root);
    this.parentElement.appendChild(this.fragment);
  }

}