export class TurnControls {
  constructor(_parentElement) {
    this.parentElement = _parentElement;
    this.fragment = document.createDocumentFragment();

    this.root = document.createElement("div");
    this.root.classList.add("TurnControls");

    this.resignButton = document.createElement("button");
    this.resignButton.innerText = "Resign"
    this.resignButton.classList.add("ResignButton");
    this.root.appendChild(this.resignButton);

    this.exchangeButton = document.createElement("button");
    this.exchangeButton.innerText = "Exchange"
    this.exchangeButton.classList.add("ExchangeButton")
    this.root.appendChild(this.exchangeButton);

    this.skipButton = document.createElement("button");
    this.skipButton.innerText = "Skip"
    this.skipButton.classList.add("SkipButton")
    this.root.appendChild(this.skipButton);

    this.submitButton = document.createElement("button");
    this.submitButton.innerText = "Submit"
    this.submitButton.classList.add("SubmitButton")
    this.root.appendChild(this.submitButton);

    this.fragment.appendChild(this.root)
    this.parentElement.appendChild(this.fragment);
  }
}