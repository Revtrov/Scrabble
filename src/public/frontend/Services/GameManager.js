import { Board } from "../Components/Board/Board.js";
import { TileBag } from "../Components/TileBag/TileBag.js";
import { SessionManager } from "./SessionManager.js";
import { Rack } from "../Components/Rack/Rack.js"
import { Player } from "../Actors/Player.js"
import { TurnAction } from "../Actors/TurnAction.js";
import { TurnControls } from "../Components/TurnControls/TurnControls.js";
import { TurnIndicator } from "../Components/TurnIndicator/TurnIndicator.js";
export class GameManager {
  constructor() {
    this.session;
    const sideLength = 15
    this.board = new Board(document.body, sideLength);
    this.tileBag = new TileBag(document.querySelector(".LeftSide"))
    this.player;
    this.turnIndicator = new TurnIndicator(document.querySelector(".LeftSide"))
    this.rack = new Rack(document.querySelector(".LeftSide"))
    this.turnControls = new TurnControls(document.querySelector(".LeftSide"))
  }
  async getSession() {
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
  async beginGame() {
    const success = await this.getSession()
    if (!success) return;
    this.player = new Player(this.session.playerData.id);
    this.rack.player = this.player;
    await this.rack.syncState(this.session.lobby);
  }

  /**
   * Runs when websocket sends action to session manager
   */
  async handleTurnAction(msg) {
    console.log(msg)
    // identify whether to act on broadcast
    // (message from this client)?
  }

  async sendTurnAction(turnAction) {
    this.session.sendTurnAction
  }
  async nextTurn() {
    await this.rack.syncState(this.session.lobby);
  }
  async submitTurn(turnAction) {
    if(typeof turnAction != TurnAction) throw new TypeError("Invalid turnAction type")
    await this.sendTurnAction(turnAction);
    await this.nextTurn()
  }
}