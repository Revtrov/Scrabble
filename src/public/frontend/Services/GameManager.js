import { Board } from "../Components/Board/Board.js";
import { TileBag } from "../Components/TileBag/TileBag.js";
import { SessionManager } from "./SessionManager.js";
import { Rack } from "../Components/Rack/Rack.js"
import { Player } from "../Actors/Player.js"
import { TurnAction } from "../Actors/TurnAction.js";
import { TurnControls } from "../Components/TurnControls/TurnControls.js";
import { TurnIndicator } from "../Components/TurnIndicator/TurnIndicator.js";
import { ExchangeModal } from "../Components/ExchangeModal/ExchangeModal.js";

export const TurnActionResult = Object.freeze({
  Success: "Success",
  Failure: "Failure",
  NotPlayersTurn: "NotPlayersTurn",
  IllegalTiles: "IllegalTiles",
  InvalidWord: "InvalidWord",
  InvalidLocation: "InvalidLocation"
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
  static exchangeModal = new ExchangeModal(document.body);
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
    const isPlayersTurn = await this.session.isPlayersTurn();
    if (!isPlayersTurn) return;
    const unvalidatedWord = this.rack.getPlacedWord()
    if (!unvalidatedWord.length) return;
    const sameRow = unvalidatedWord.every(tile => tile.cell.i === unvalidatedWord[0].cell.i);
    const sameCol = unvalidatedWord.every(tile => tile.cell.j === unvalidatedWord[0].cell.j);
    const onSameLine = sameRow || sameCol;
    if (!onSameLine) {
      this.board.showPlacementError();
      throw new Error("tiles must be on the same line")
    }
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
        tiles: sorted.map(tile => ({
          id: tile.data.id,
          i: tile.cell.i,
          j: tile.cell.j
        }))
      }
    })
    switch (result.data) {
      case TurnActionResult.NotPlayersTurn:
        this.turnIndicator.showTurnError();
        break;
      case TurnActionResult.IllegalTiles:
        break;
      case TurnActionResult.InvalidWord:
        this.board.showPlacementError();
        break;
      case TurnActionResult.InvalidLocation:
        this.board.showPlacementError();
        break;
      case TurnActionResult.Success:
        // progress turn
        break;
    }
    return result.data
  }

  static async sendPass() {
    const result = await this.sendTurnAction({
      type: "Pass",
    })
    switch (result.data) {
      case TurnActionResult.NotPlayersTurn:
        this.turnIndicator.showTurnError();
        break;
      case TurnActionResult.Success:
        break;
    }
    return result.data
  }
  static async sendResign() {
    const result = await this.sendTurnAction({
      type: "Resign",
    })
    window.location.href = ""
  }
  static async openExchange() {
    const isPlayersTurn = await this.session.isPlayersTurn();
    if (!isPlayersTurn) return;
    this.exchangeModal.toggle(false)
  }
  static async sendExchange(tiles) {
    const result = await this.sendTurnAction({
      type: "Exchange",
      data: {
        tileIds: tiles.map(tile => tile.data.id)
      }
    })
    switch (result.data) {
      case TurnActionResult.NotPlayersTurn:
        this.turnIndicator.showTurnError();
        // reset turn
        break;
      case TurnActionResult.IllegalTiles:
        // reset turn
        break;
      case TurnActionResult.Success:
        // progress turn
        break;
    }
    return result.data
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
        break;
      case "Board":
        await this.board.updateState(msg);
        break;
      case "Rack":
        await this.rack.updateState();
        break;
      case "TurnIndicator":
        await this.turnIndicator.updateState(msg);
        break;
      case "PlayerDisconnect":
        const didYouLeave = msg.stateUpdate.data.player.id == Player.playerId
        alert(`${didYouLeave ? "You" : msg.stateUpdate.data.player.id} left.`)
      case "GameEnd":
        const didYouWin = msg.stateUpdate.data.winner.id == Player.playerId
        alert(`Game Over\n${didYouWin ? "You Won!" : "You Lost"}`);
        location.href = ""
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