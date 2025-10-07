export class TileBag {
  constructor(_parentElement) {
    this.parentElement = _parentElement
    this.fragment = document.createDocumentFragment()

    this.root = document.createElement('div')
    this.root.classList.add('Bag')

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

    /* Remaining Tile Count */
    this.tilesLeft = document.createElement('div')
    this.tilesLeft.classList.add('TilesLeft')
    this.tilesLeftNumber = document.createElement('div')
    this.tilesLeftNumber.innerText = '0'
    this.tilesLeft.appendChild(this.tilesLeftNumber)
    this.root.appendChild(this.tilesLeft)

    this.fragment.appendChild(this.root)
    this.parentElement.appendChild(this.fragment)
  }

  async udpateState(msg){
    //console.log(msg);
    if(!msg?.stateUpdate?.data) throw new Error("State had no data")
    this.tilesLeftNumber.innerText = msg?.stateUpdate?.data?.tileBag?.remainingCount ?? 0;
    this.consonantsLeftNumber.innerText = msg?.stateUpdate?.data?.tileBag?.consonantCount ?? 0;
    this.vowelsLeftNumber.innerText = msg?.stateUpdate?.data?.tileBag?.vowelCount ?? 0;
  
  }
}
