import { GameManager, TurnActionResult } from "../../Services/GameManager.js";
import { onDragMessage, tileMap } from "../Tile/Tile.js";

export class ExchangeModal {
  constructor(_parentElement) {
    this.parentElement = _parentElement;
    this.fragment = document.createDocumentFragment();

    this.root = document.createElement("div");
    this.root.classList.add("ExchangeModal");

    this.exchangeModalBackgroundDim = document.createElement("div")
    this.exchangeModalBackgroundDim.classList.add("ExchangeModalBackgroundDim")
    
    this.root.classList.toggle("Closed", true)
    this.exchangeModalBackgroundDim.classList.toggle("Closed", true)

    this.title = document.createElement("div");
    this.title.classList.add("Title")
    this.title.innerText = "EXCHANGE"
    this.root.appendChild(this.title)

    this.exchangeBay = document.createElement("div");
    this.exchangeBay.classList.add("ExchangeBay");
    this.exchangeBay.ondragover = (e) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
    }
    this.exchangeBay.ondragend = this.exchangeBay.ondrop = (e) => {
      this.onDrop(e)
    }
    this.root.appendChild(this.exchangeBay)

    this.buttonContainer = document.createElement("div");
    this.buttonContainer.classList.add("ButtonContainer")

    this.submitButton = document.createElement("button")
    this.submitButton.innerText = "Submit";
    this.submitButton.onclick = async () => {
      await this.submit();
    }
    this.buttonContainer.appendChild(this.submitButton)

    this.cancelButton = document.createElement("button")
    this.cancelButton.classList.add("Cancel")
    this.cancelButton.innerText = "Cancel";
    this.cancelButton.onclick = async (e) => {
      this.onCancel(e)
    }
    this.buttonContainer.appendChild(this.cancelButton)

    this.root.appendChild(this.buttonContainer)

    this.fragment.appendChild(this.root);
    this.fragment.appendChild(this.exchangeModalBackgroundDim);
    this.parentElement.appendChild(this.fragment)

    this.tiles = new Set();
  }
  toggle(closed) {
    this.root.classList.toggle("Closed", closed)
    this.exchangeModalBackgroundDim.classList.toggle("Closed", closed)
  }
  async onCancel(e){
    this.tiles.clear()
    this.exchangeBay.innerHTML = []
    this.toggle(true)
    await GameManager.rack.updateState()
  }

  onDrop(e) {
    e.preventDefault();
    //this.root.classList.remove('drag-over');

    const tile = tileMap.get(e.dataTransfer.getData(onDragMessage));
    if (!tile) return;

    this.tiles.add(tile);

    if (tile.parentElement) {
      if (tile.cell) tile.cell.tile = null;
      tile.parentElement.removeChild(tile.root);
    }

    tile.parentElement = this.exchangeBay;
    tile.cell = null;

    const rect = this.exchangeBay.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const section = Math.floor((x / rect.width) * 7);

    if (section >= this.exchangeBay.children.length) {
      this.exchangeBay.appendChild(tile.root);
    } else {
      this.exchangeBay.insertBefore(tile.root, this.exchangeBay.children[section]);
    }
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
    const tiles = Array.from(this.exchangeBay.children)
      .map(el => tileMap.get(el.dataset.id))
      .filter(Boolean);

    if (!tiles.length) {
      console.warn("No tiles to exchange");
      return;
    }

    await this.sendAction(
      () => GameManager.sendExchange(tiles),
      () => {
        this.toggle(true)
        this.exchangeBay.innerHTML = ""
      },
      () => {
        this.toggle(true)
      }
    );
  }
}