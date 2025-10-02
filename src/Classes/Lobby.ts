import { getOrCreateWSS } from "../server"; ``
import { SafeWebSocketServer, ServerResponse } from "../websocket";
import { Board } from "./Board";
import { Player } from "./Player";
import { GameManager } from "./services/GameManager";
import { Tile } from "./Tile";
import { TileBag } from "./TileBag";
import { v4 as uuid4 } from "uuid";

export const lobbyMap: Map<string, Lobby> = new Map();
export class Lobby {
  private players: Set<Player> = new Set();
  public playerIdMap: Map<string, Player> = new Map();
  private tileBag = new TileBag();
  private wss: SafeWebSocketServer;
  private id: string = uuid4();
  private clients: Set<string> = new Set();
  private clientToPlayerMap: Map<string, Player> = new Map();
  private playerToClientMap: Map<Player, string> = new Map();
  private gameManager: GameManager;
  private playerSlots: number = 2;
  constructor() {

    this.gameManager = new GameManager(this, this.players);
    this.createPlayers();

    lobbyMap.set(this.id, this);
    this.wss = getOrCreateWSS();
  }

  asDTO() {
    return {
      id: this.id,
      players: Array.from(this.players.values()).map((p) => p.asDTO()),
      clientCount: this.clients.size
    };
  }

  registerClient(clientId: string, requestId: string, wss: SafeWebSocketServer) {
    const existingPlayer = this.clientToPlayerMap.get(clientId);
    if (existingPlayer) {
      wss.sendToClient(requestId, clientId, existingPlayer.asDTO());
      return;
    }

    let playerToAssign: Player | undefined;
    for (const player of this.players) {
      if (!this.playerToClientMap.has(player)) {
        playerToAssign = player;
        break;
      }
    }

    if (!playerToAssign) {
      wss.sendToClient(requestId, clientId, { error: "Lobby Full" });
      return
    };

    this.clientToPlayerMap.set(clientId, playerToAssign);
    this.playerToClientMap.set(playerToAssign, clientId);
    this.clients.add(clientId);

    wss.sendToClient(requestId, clientId, playerToAssign.asDTO());
  }
  createPlayers(): void {
    for (let i = 0; i < this.playerSlots; i++) {
      const newPlayer = new Player(this.tileBag, this)
      this.players.add(newPlayer)

      this.playerIdMap.set(newPlayer.getId(), newPlayer)
    }
  }
  getRacks() {
    return [...this.players.values()].map(player => player.getRack().getValue())
  }
  handleMessage(msg: ServerResponse, wss: SafeWebSocketServer) {
    switch (msg.type) {
      case "register":
        if (!msg.clientId || !msg.requestId) return;
        this.registerClient(msg.clientId, msg.requestId, wss);
        break;
      case "turnAction":
        if (!msg.clientId || !msg.requestId) return;
        this.gameManager.handleTurnAction(msg)
        this.wss.broadcast(msg);
    }
  }
  handleClientDisconnect(id: string) {

  }
}