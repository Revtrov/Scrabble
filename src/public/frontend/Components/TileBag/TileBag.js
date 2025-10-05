import { GameManager } from "../../Services/GameManager.js"

const scrabbleTiles = {
  A: 9,
  B: 2,
  C: 2,
  D: 4,
  E: 12,
  F: 2,
  G: 3,
  H: 2,
  I: 9,
  J: 1,
  K: 1,
  L: 4,
  M: 2,
  N: 6,
  O: 8,
  P: 2,
  Q: 1,
  R: 6,
  S: 4,
  T: 6,
  U: 4,
  V: 2,
  W: 2,
  X: 1,
  Y: 2,
  Z: 1,
  Blank: 2,
}

export class TileBag {
  constructor(_parentElement) {
    this.parentElement = _parentElement
    this.fragment = document.createDocumentFragment()

    this.root = document.createElement('div')
    this.root.classList.add('Bag')

    // this.image = new Image()
    // this.image.classList.add('Image')
    // this.image.src = './images/sack.svg'
    // this.image.draggable = false
    // this.root.appendChild(this.image)

    /* Remaining Tile Count */
    this.tilesLeft = document.createElement('div')
    this.tilesLeft.classList.add('TilesLeft')
    this.tilesLeftLabel = document.createElement('div')
    this.tilesLeftLabel.innerText = 'Tile Bag'
    this.tilesLeft.appendChild(this.tilesLeftLabel)
    this.tilesLeftNumber = document.createElement('div')
    this.tilesLeftNumber.innerText = '0'
    this.tilesLeft.appendChild(this.tilesLeftNumber)
    this.root.appendChild(this.tilesLeft)

    /* Vowels/Consonants */
    this.letterTypeContainer = document.createElement('div')
    this.letterTypeContainer.classList.add("LetterTypeContainer")

    this.vowelsLeft = document.createElement('div')
    this.vowelsLeft.classList.add('VowelsLeft')
    this.vowelsLeftLabel = document.createElement('div')
    this.vowelsLeftLabel.innerText = 'Vowels:'
    this.vowelsLeft.appendChild(this.vowelsLeftLabel)
    this.vowelsLeftNumber = document.createElement('div')
    this.vowelsLeftNumber.classList.add("Quantity")
    this.vowelsLeftNumber.innerText = '0'
    this.vowelsLeft.appendChild(this.vowelsLeftNumber)
    this.letterTypeContainer.appendChild(this.vowelsLeft)

    this.consonantsLeft = document.createElement('div')
    this.consonantsLeft.classList.add('ConsonantsLeft')
    this.consonantsLeftLabel = document.createElement('div')
    this.consonantsLeftLabel.innerText = 'Consonants:'
    this.consonantsLeft.appendChild(this.consonantsLeftLabel)
    this.consonantsLeftNumber = document.createElement('div')
    this.consonantsLeftNumber.classList.add("Quantity")
    this.consonantsLeftNumber.innerText = '0'
    this.consonantsLeft.appendChild(this.consonantsLeftNumber)
    this.letterTypeContainer.appendChild(this.consonantsLeft)

    this.root.appendChild(this.letterTypeContainer)

    /* Remaining Tiles */
    this.remainingLettersContainer = document.createElement('div')
    this.remainingLettersContainer.classList.add('RemainingLettersContainer')
    this.root.appendChild(this.remainingLettersContainer)

    this.fragment.appendChild(this.root)
    this.parentElement.appendChild(this.fragment)
  }

  async udpateState(tileBagState){
  }
}
