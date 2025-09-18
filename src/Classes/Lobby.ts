import { SafeWebSocketServer,ServerResponse } from "../websocket";

export const lobbyMap: Map<string, Lobby> = new Map();
export class Lobby {
  constructor() {

  }
  handleMessage(msg:ServerResponse, wss:SafeWebSocketServer){

  }
  handleClientDisconnect(id:string){

  }
}