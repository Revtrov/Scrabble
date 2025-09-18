export class Bag {
  constructor(_parentElement) {
    this.parentElement = _parentElement
    this.fragment = document.createDocumentFragment()

    this.root = document.createElement('div')
    this.root.classList.add('Bag')

    this.image = new Image();
    this.image.src = "./images/sack.svg";
    this.image.draggable = false
    this.root.appendChild(this.image)
    
    this.fragment.appendChild(this.root)
    this.parentElement.appendChild(this.fragment)
  }
}
