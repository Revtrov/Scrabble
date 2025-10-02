export class TurnIndicator {
  constructor(_parentElement) {
    this.parentElement = _parentElement;
    this.fragment = document.createDocumentFragment();

    this.root = document.createElement("div");
    this.root.classList.add("TurnIndicator")

    this.fragment.appendChild(this.root)
    this.parentElement.appendChild(this.fragment)
  }
}