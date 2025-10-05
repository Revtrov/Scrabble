import { Player } from "../../Actors/Player.js";
import { GameManager, TurnActionResult } from "../../Services/GameManager.js";



export class TurnControls {
  constructor(_parentElement) {
    this.parentElement = _parentElement;
    this.fragment = document.createDocumentFragment();

    this.root = document.createElement("div");
    this.root.classList.add("TurnControls");

    this.resignButton = document.createElement("button");
    this.resignButton.innerText = "Resign"
    this.resignButton.classList.add("ResignButton");
    this.resignButton.onclick = () => this.resign()
    this.root.appendChild(this.resignButton);

    this.exchangeButton = document.createElement("button");
    this.exchangeButton.innerText = "Exchange"
    this.exchangeButton.classList.add("ExchangeButton")
    this.exchangeButton.onclick = () => this.exchange()
    this.root.appendChild(this.exchangeButton);

    this.skipButton = document.createElement("button");
    this.skipButton.innerText = "Skip"
    this.skipButton.classList.add("SkipButton")
    this.skipButton.onclick = () => this.skip()
    this.root.appendChild(this.skipButton);

    this.submitButton = document.createElement("button");
    this.submitButton.innerText = "Submit"
    this.submitButton.classList.add("SubmitButton")
    this.submitButton.onclick = () => this.submit()
    this.root.appendChild(this.submitButton);

    this.fragment.appendChild(this.root)
    this.parentElement.appendChild(this.fragment);

  }
  async sendAction(action, onSuccess, onFailure) {
    const turnActionResult = await action();
    switch (turnActionResult) {
      case TurnActionResult.Success:
        return await onSuccess();
      case TurnActionResult.Failure:
        return await onFailure();
    }
  }
  async submit() {
    await this.sendAction(() => GameManager.sendMove(), () => { }, () => { })
  }
  async exchange() {
    await this.sendAction(() => GameManager.sendExchange(), () => { }, () => { })
  }
  async skip() {
    await this.sendAction(() => GameManager.sendPass(), () => { }, () => { })
  }
  resign() {
    console.log(Player.playerId, "resign")
    // send resign action (not really a turn action)
  }
}
