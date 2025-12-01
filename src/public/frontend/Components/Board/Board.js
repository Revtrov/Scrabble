import { Square } from '../Cell/Cell.js'

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
    alphabetLower.slice(0, this.sideLength).forEach((char) => {
      const letter = document.createElement('div')
      letter.innerText = char
      this.letterIndexesTop.appendChild(letter)
    }) // <div> a - +o </div>
    this.root.appendChild(this.letterIndexesTop)


    this.letterIndexesBottom = this.letterIndexesTop.cloneNode(true);
    this.letterIndexesBottom.classList.add("Bottom")
    this.root.appendChild(this.letterIndexesBottom)

    this.numberIndexesLeft = document.createElement('div')
    this.numberIndexesLeft.classList.add('NumberIndexes')
    Array(this.sideLength).fill(0).forEach((_, i) => {
      const num = document.createElement('div')
      num.innerText = i + 1
      this.numberIndexesLeft.appendChild(num)
    }) // <div> 1 - +15 </div>
    this.root.appendChild(this.numberIndexesLeft)

    this.numberIndexesRight = this.numberIndexesLeft.cloneNode(true);
    this.numberIndexesRight.classList.add("Right")
    this.root.appendChild(this.numberIndexesRight)

    this.squareContainer = document.createElement('div')
    this.squareContainer.classList.add('SquareContainer')
    this.squareContainerFragment = document.createDocumentFragment()
    this.squareGrid = Array.from({ length: this.sideLength }, () => Array.from({ length: this.sideLength }, () => new Square(this.squareContainer)))

    this.squareContainer.appendChild(this.squareContainerFragment)
    this.root.appendChild(this.squareContainer)


    this.title = document.createElement('div')
    this.title.textContent = 'SCROBBLE'
    this.title.classList.add('Title')
    this.root.appendChild(this.title)

    this.fragment.appendChild(this.root)
    this.parentElement.appendChild(this.fragment)
  }

  async fetchState() {

  }
  setNumIndexes() {
    this.numberIndexesLeft.innerHTML = ""
    this.numberIndexesRight.innerHTML = ""
    Array(this.sideLength).fill(0).forEach((_, i) => {
      const num = document.createElement('div')
      num.innerText = i + 1
      this.numberIndexesLeft.appendChild(num.cloneNode(true))
      this.numberIndexesRight.appendChild(num.cloneNode(true))
    })
  }
  setLetterIndexes() {
    this.letterIndexesTop.innerHTML = ""
    this.letterIndexesBottom.innerHTML = ""
    Array(this.sideLength).fill(0).forEach((_, i) => {
      const index = document.createElement('div')
      const letter = alphabetLower[i % alphabetLower.length];
      const repeat = Math.floor(i / alphabetLower.length);
      index.innerText = letter + (repeat > 0 ? repeat : "");
      this.letterIndexesTop.appendChild(index.cloneNode(true))
      this.letterIndexesBottom.appendChild(index.cloneNode(true))
    }) 
  }
  async updateState(msg) {
    const boardState = msg?.stateUpdate?.data?.board
    if (!boardState) throw new Error("Invalid boardState");
    this.squareContainer.innerHTML = ""
    this.sideLength = boardState.sideLength
    this.setNumIndexes()
    this.setLetterIndexes()
    document.documentElement.style.setProperty('--board-size', boardState.sideLength);
    this.squareGrid = Array.from({ length: boardState.sideLength }, () => Array.from({ length: boardState.sideLength }, () => new Square(this.squareContainer)))

    for (let i = 0; i < boardState.grid.length; i++) {
      for (let j = 0; j < boardState.grid.length; j++) {
        this.squareGrid[i][j].updateState(boardState.grid[i][j]);
      }
    }
  }
  showPlacementError() {
    console.log("Check")
    for (let i = 0; i < this.squareGrid.length; i++) {
      for (let j = 0; j < this.squareGrid[i].length; j++) {
        const tile = this.squareGrid[i][j].tile;
        console.log(tile)
        if (tile && tile.fromRack) {
          tile.root.classList.toggle("Error", true)
          setTimeout(() => {
            tile.root.classList.toggle("Error", false)
          }, 1000)
        }
      }
    }
  }
}
