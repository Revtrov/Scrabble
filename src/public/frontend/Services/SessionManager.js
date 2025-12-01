import SafeWebSocket from './SafeWebSocket.js'
import { SessionConfigurationModal } from '../Components/SessionConfiguration/SessionConfiguration.js'
export const api = 'http://localhost:3000/api'
import { generateUUID } from './lib.js'
import { Player } from '../Actors/Player.js'
export class SessionManager {
  constructor(_gameManager) {
    this.ws
    this.id = generateUUID()
    this.lobby
    this.turn = 0
    this.webSocketConnected = false
    this.gameManager = _gameManager
    this.playerData;
  }
  async connectSocket() {
    try {
      const res = await this.ws.request({ type: 'connect', clientId: this.id })
      this.ws.on("turnAction", (msg) => this.gameManager.handleTurnAction(msg))
      this.ws.on("stateUpdate", (msg) => this.gameManager.handleStateUpdate(msg))
      return true
    } catch (err) {
      console.error('Connection timed out:', err)
      return false
    }
  }
  async fetchLobbyList() {
    const res = await fetch(api + '/lobby/list')
    return await res.json()
  }
  async configureSession() {
    const lobbies = await this.fetchLobbyList();
    const sessionConfigModal = new SessionConfigurationModal(document.body, this, lobbies, this.fetchLobbyList.bind(this));
    return false
  }
  async createSession() {
    const res = await fetch(api + '/lobby/create')
    this.lobby = await res.json()
    if (res.status == 200) {
      window.location.href = "?lobbyId=" + this.lobby.id
      return true
    } else {
      return false;
    }

  }
  async loadSession(id) {
    const res = await fetch(api + '/lobby/' + id)
    this.lobby = await res.json()
    if (res.status == 200) {
      this.ws = new SafeWebSocket()
      this.webSocketConnected = await this.connectSocket()
      this.playerData = await this.registerPlayer()
      if (this.playerData?.error) {
        window.location.href = "/"
        return false
      }
      return true
    } else {
      window.location.href = "/"
      return false;
    }

  }
  async joinSession(id) {
    const res = await fetch(api + '/lobby/' + id)
    this.lobby = await res.json()
    if (res.status == 200) {
      window.location.href = "?lobbyId=" + this.lobby.id
      return true
    } else {
      return false;
    }
  }
  async apiWithLobby() {
    return api + '/lobby/' + this.lobby.id
  }
  async refreshBoardState() {
    await this.gameManager.board.fetchState()
  }
  async registerPlayer() {
    const { data } = await this.ws.request({
      type: 'register',
      clientId: this.id,
      lobbyId: this.lobby.id

    })
    return data
  }
  async isPlayersTurn() {
    const res = await fetch(api + '/lobby/' + this.lobby.id + "/player/" + Player.playerId + "/is-players-turn")
    return await res.json(res)
  }
  async fetchLobby() {
    const res = await fetch(api + '/lobby/' + this.lobby.id)
    this.lobby = await res.json()
    return this.lobby
  }

  async fetchBoardState() {

  }
  async sendTurnAction(turnAction) {
    const res = await this.ws.request({
      type: 'turnAction',
      clientId: this.id,
      lobbyId: this.lobby.id,
      playerId: Player.playerId,
      turnAction
    })
    console.log(res)
    return res;
  }
}