import { Square } from '../Square/Square.js'
import { Tile } from '../Tile/Tile.js'

const alphabetLower = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i),
)

export class Board {
  constructor(_parentElement, _sideLength) {
    if (!_sideLength) throw new Error('Board must have side length')
    this.sideLength = _sideLength

    this.parentElement = _parentElement
    this.fragment = document.createDocumentFragment()

    this.root = document.createElement('div')
    this.root.classList.add('Board')

    this.letterIndexesTop = document.createElement('div')
    this.letterIndexesTop.classList.add('LetterIndexes')
    alphabetLower.slice(0, 15).forEach((char) => {
      const letter = document.createElement('div')
      letter.innerText = char
      this.letterIndexesTop.appendChild(letter)
    }) // <div> a - +o </div>
    this.root.appendChild(this.letterIndexesTop)


    this.letterIndexesBottom = this.letterIndexesTop.cloneNode(true);
    this.letterIndexesBottom.classList.add("Bottom")
    this.root.appendChild(this.letterIndexesBottom.cloneNode(true))

    this.numberIndexesLeft = document.createElement('div')
    this.numberIndexesLeft.classList.add('NumberIndexes')
    Array(15).fill(0).forEach((_, i) => {
      const num = document.createElement('div')
      num.innerText = i + 1
      this.numberIndexesLeft.appendChild(num)
    }) // <div> 1 - +15 </div>
    this.root.appendChild(this.numberIndexesLeft)

    this.numberIndexesRight = this.numberIndexesLeft.cloneNode(true);
    this.numberIndexesRight.classList.add("Right")
    this.root.appendChild(this.numberIndexesRight)

    this.squareGrid = new Array()
    this.squareContainer = document.createElement('div')
    this.squareContainer.classList.add('SquareContainer')
    this.squareContainerFragment = document.createDocumentFragment()

    for (let i = 0; i < this.sideLength; i++) {
      this.squareGrid.push([])
      for (let j = 0; j < this.sideLength; j++) {
        this.squareGrid[i].push(new Square(this.squareContainerFragment))
      }
    }
    const testTile = new Tile(this.squareGrid[0][0].root, {
      letter: 'A',
      value: '1',
      id: '123123123',
    })
    this.squareContainer.appendChild(this.squareContainerFragment)
    this.root.appendChild(this.squareContainer)


    this.title = document.createElement('div')
    this.title.textContent = 'SCROBBLE'
    this.title.classList.add('Title')
    this.root.appendChild(this.title)

    this.fragment.appendChild(this.root)
    this.parentElement.appendChild(this.fragment)
  }
}
