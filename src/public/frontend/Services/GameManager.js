import { Board } from "../Components/Board/Board.js";
import { TileBag } from "../Components/TileBag/TileBag.js";
import { SessionManager } from "./SessionManager.js";
import { Rack } from "../Components/Rack/Rack.js"
import { Player } from "../Actors/Player.js"
import { TurnAction } from "../Actors/TurnAction.js";
import { TurnControls } from "../Components/TurnControls/TurnControls.js";
import { TurnIndicator } from "../Components/TurnIndicator/TurnIndicator.js";

export const TurnActionResult = Object.freeze({
  Success: "Success",
  Failure: "Failure",
})

export const Direction = Object.freeze({
  Horizontal: "H",
  Vertical: "V",
})

export class GameManager {
  static session;
  static sideLength = 15;
  static board = new Board(document.body, this.sideLength);
  static tileBag = new TileBag(document.querySelector(".LeftSide"))
  static turnIndicator = new TurnIndicator(document.querySelector(".LeftSide"))
  static rack = new Rack(document.querySelector(".LeftSide"))
  static turnControls = new TurnControls(document.querySelector(".LeftSide"))
  static async getSession() {
    this.session = new SessionManager(this)
    if (new URLSearchParams(window.location.search).get('lobbyId')) {
      await this.session.loadSession(
        new URLSearchParams(window.location.search).get('lobbyId'),
      )
      this.session.gameManager = this;
      return true
    } else {
      await this.session.configureSession()
      return false
    }
  }
  static async beginGame() {
    const success = await this.getSession()
    if (!success) return;
    Player.setPlayerId(this.session.playerData.id);
    await this.rack.syncState(this.session.lobby);
  }

  static async sendMove() {
    const unvalidatedWord = this.rack.getPlacedWord()
    if (!unvalidatedWord.length) return;
    const sameRow = unvalidatedWord.every(tile => tile.cell.i === unvalidatedWord[0].cell.i);
    const sameCol = unvalidatedWord.every(tile => tile.cell.j === unvalidatedWord[0].cell.j);
    const onSameLine = sameRow || sameCol;
    if (!onSameLine) throw new Error("tiles must be on the same line")
    const sorted = [...unvalidatedWord].sort((a, b) =>
      a.cell.i - b.cell.i || a.cell.j - b.cell.j
    );
    const startIndex = sameRow ?
      { i: sorted[0].cell.i, j: Math.min(...sorted.map(t => t.cell.j)) } :
      {
        i: Math.min(...sorted.map(t => t.cell.i)), j: sorted[0].cell.j
      }
    const result = await this.sendTurnAction({
      type: "Move",
      data: {
        direction: sameRow ? Direction.Horizontal : Direction.Vertical,
        startIndex,
        tileIds: sorted.map(tile => tile.data.id)
      }
    })
    switch (result.data) {
      case TurnAction.Failure:
        // reset turn
        break;
      case TurnAction.Success:
        // progress turn
        break;
    }
    return result.data
  }

  static async sendPass() {
    return await this.sendTurnAction({
      type: "Pass",
    })
  }

  static async sendExchange(tiles) {
  }
  /**
   * Runs when websocket sends action to session manager
   */
  static async handleTurnAction(msg) {
    // identify whether to act on broadcast
    // (message from this client)?
  }
  static async handleStateUpdate(msg) {
    console.log(msg)
    switch (msg.stateUpdate.type) {
      case "TileBag":
        await this.tileBag.udpateState(msg)
      case "Board":
        await this.board.updateState(msg);
      case "Rack":
        await this.rack.updateState();
    }
    // identify whether to act on broadcast
    // (message from this client)?
  }

  static async sendTurnAction(turnAction) {
    return await this.session.sendTurnAction(turnAction)
  }
  static async submitTurn(turnAction) {
    if (typeof turnAction != TurnAction) throw new TypeError("Invalid turnAction type")
    await this.sendTurnAction(turnAction);
  }
}