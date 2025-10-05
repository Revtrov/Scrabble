import { Player } from "../../Actors/Player.js";
import { GameManager } from "../../Services/GameManager.js";

export class TurnControls {
  constructor(_parentElement) {
    this.parentElement = _parentElement;
    this.fragment = document.createDocumentFragment();

    this.root = document.createElement("div");
    this.root.classList.add("TurnControls");

    this.resignButton = document.createElement("button");
    this.resignButton.innerText = "Resign"
    this.resignButton.classList.add("ResignButton");
    this.resignButton.onclick = this.resign
    this.root.appendChild(this.resignButton);

    this.exchangeButton = document.createElement("button");
    this.exchangeButton.innerText = "Exchange"
    this.exchangeButton.classList.add("ExchangeButton")
    this.exchangeButton.onclick = this.exchange
    this.root.appendChild(this.exchangeButton);

    this.skipButton = document.createElement("button");
    this.skipButton.innerText = "Skip"
    this.skipButton.classList.add("SkipButton")
    this.skipButton.onclick = this.skip
    this.root.appendChild(this.skipButton);

    this.submitButton = document.createElement("button");
    this.submitButton.innerText = "Submit"
    this.submitButton.classList.add("SubmitButton")
    this.submitButton.onclick = this.submit
    this.root.appendChild(this.submitButton);

    this.fragment.appendChild(this.root)
    this.parentElement.appendChild(this.fragment);
  }

  async submit() {
    console.log(Player.playerId, "submit");
    await GameManager.sendMove()
    // await GameManager.sendTurnAction({
    //   type:"Move"
    // })
    // get placed tiles, format as move action
    // send turnaction to gamemanager
  }
  async exchange() {
    console.log(Player.playerId, "exchange")
    // await GameManager.sendTurnAction({
    //   type:"Exchange"
    // })
    // make exchange modal where you can drop tiles to exchange
    // then that modal send turnaction to gamemanager
  }
  async skip() {
    console.log(Player.playerId, "skip")
    await GameManager.sendTurnAction({
      type:"Pass",
    })
    // send skip turn action
  }
  resign() {
    console.log(Player.playerId, "resign")
    // send resign action (not really a turn action)
  }
}
