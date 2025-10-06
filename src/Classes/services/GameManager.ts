import { ServerResponse } from "../../websocket";
import { Board } from "../Board";
import { Lobby } from "../Lobby";
import { Player } from "../Player";
import { z } from "zod";
import { TileBag } from "../TileBag";
import { Dictionary } from "../Dictionary";
import { Rack } from "../Rack";

enum StateUpdateType {
  TileBag = "TileBag",
  Board = "Board",
  Rack = "Rack",
  TurnIndicator = "TurnIndicator"
}
export interface StateUpdateBody {
  type: StateUpdateType,
  data: any

}
export interface StateUpdateMessage extends ServerResponse {
  type: string,
  stateUpdate: StateUpdateBody,
}

enum TurnActionId { Move = "Move", Exchange = "Exchange", Pass = "Pass" }

export enum Direction {
  Vertical = "V",
  Horizontal = "H"
}
export interface Coord {
  i: number,
  j: number
}

const MoveDataSchema = z.object({
  direction: z.string(),
  startIndex: z.object({
    i: z.number(),
    j: z.number()
  }),
  tileIds: z.array(z.string())
});

const ExchangeDataSchema = z.object({
  tileIds: z.array(z.string())
});

const PassDataSchema = z.undefined();

const TurnActionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal(TurnActionId.Move), data: MoveDataSchema }),
  z.object({ type: z.literal(TurnActionId.Exchange), data: ExchangeDataSchema }),
  z.object({ type: z.literal(TurnActionId.Pass), data: PassDataSchema }),
]);

type TurnActionDTO = z.infer<typeof TurnActionSchema>;

enum TurnActionResult {
  Success = "Success",
  Failure = "Failure",
  InvalidWord = "InvalidWord",
  IllegalTiles = "IllegalTiles",
  NotPlayersTurn = "NotPlayersTurn"
}

export class GameManager {
  private lobby: Lobby;
  private players: Set<Player>;
  private board: Board;
  private turnOrder: Array<Player>;
  private turnIndex: number = 0;
  private turnNumber: number = 1;
  private tileBag: TileBag;
  constructor(lobby: Lobby, players: Set<Player>) {
    this.lobby = lobby;
    this.players = players;
    this.turnOrder = [...this.players.values()];
    this.tileBag = new TileBag()
    for (const player of this.players.values()) {
      player.setRack(new Rack(this.tileBag));
    }
    this.board = new Board()
    this.board.print()
  }

  handleTurnAction(msg: ServerResponse) {
    if (!msg.turnAction) return;

    let action: TurnActionDTO;
    try {
      action = TurnActionSchema.parse(msg.turnAction);
    } catch (err) {
      console.error("Invalid action:", err);
      return;
    }
    let turnActionResult: TurnActionResult;
    switch (action.type) {
      case TurnActionId.Move:
        turnActionResult = this.handleMove(msg.playerId, action.data);
        break;
      case TurnActionId.Exchange:
        turnActionResult = this.handleExchange(msg.playerId, action.data);
        break;
      case TurnActionId.Pass:
        turnActionResult = this.handlePass(msg.playerId, action.data);
        break;
    }
    this.lobby.respondToClient(msg.requestId, msg.clientId, turnActionResult);
    if (turnActionResult == TurnActionResult.Success) {
      this.advanceTurn();
    }
  }
  private handleMove(playerId: string, moveData: z.infer<typeof MoveDataSchema>): TurnActionResult {
    const { direction, startIndex, tileIds } = moveData;

    const player = this.lobby.playerIdMap.get(playerId);
    if (player.getId() !== this.turnOrder[this.turnIndex].getId()) {
      console.log(new Error(`Not player ${player.getId()}'s turn`))
      return TurnActionResult.NotPlayersTurn;
    }

    const playerRack = player.getRack()
    if (!playerRack.hasTileIds(tileIds)) {
      console.log(new Error("Used tiles not in player's Rack"))
      return TurnActionResult.IllegalTiles;
    }
    const tiles = tileIds.map(tileId => playerRack.getTileIdMap().get(tileId));
    // this should be sorted on client, maybe should sort here just in case
    const strWord = tiles.map(tile => tile.getLetter()).join("");
    const validWord = Dictionary.hasWord(strWord);
    if (!validWord) {
      console.log(new Error(`${strWord} not in Dictionary`))
      return TurnActionResult.InvalidWord
    };
    // check if connected words too
    // update board
    let containsTarget = false;
    if (direction === Direction.Horizontal) {
      containsTarget = (this.board.getStartIndex().j === startIndex.j) &&
        (this.board.getStartIndex().i >= startIndex.i) &&
        (this.board.getStartIndex().i < startIndex.i + tiles.length);
    } else {
      containsTarget = (this.board.getStartIndex().i === startIndex.i) &&
        (this.board.getStartIndex().j >= startIndex.j) &&
        (this.board.getStartIndex().j < startIndex.j + tiles.length);
    }
    this.board.placeWord(direction as Direction, startIndex as Coord, tiles);
    playerRack.removeTiles(tiles);
    playerRack.fill()
    return TurnActionResult.Success;
  }

  private handleExchange(playerId: string, exchangeData: z.infer<typeof ExchangeDataSchema>): TurnActionResult {
    // remove tiles from rack, draw new ones from bag
    return TurnActionResult.Success;
  }

  private handlePass(playerId: string, _: z.infer<typeof PassDataSchema>): TurnActionResult {
    // maybe track consecutive passes to end the game
    const player = this.lobby.playerIdMap.get(playerId);
    if (player.getId() !== this.turnOrder[this.turnIndex].getId()) {
      console.log(new Error(`Not player ${player.getId()}'s turn`))
      return TurnActionResult.NotPlayersTurn;
    }
    return TurnActionResult.Success;
  }
  private broadcastStates() {
    for (const state of Object.values(this.getStates()) as ServerResponse[]) {
      this.lobby.broadcast(state);
    };
  }
  public sendStatesToClient(clientId: string) {
    for (const state of Object.values(this.getStates()) as ServerResponse[]) {
      state.clientId = clientId;
      this.lobby.sendToClient(state);
    };
  }
  private getStates(): Record<any, ServerResponse> {
    const tileBagUpdate: ServerResponse = {
      type: "stateUpdate",
      stateUpdate: {
        type: StateUpdateType.TileBag,
        data: {
          tileBag: this.tileBag.asDTO()
        }
      }
    }
    const boardUpdate: ServerResponse = {
      type: "stateUpdate",
      stateUpdate: {
        type: StateUpdateType.Board,
        data: {
          board: this.board.asDTO()
        }
      }
    }
    const rackUpdate: ServerResponse = {
      type: "stateUpdate",
      stateUpdate: {
        type: StateUpdateType.Rack,
        data: null
      }
    }
    const turnIndicatorUpdate: ServerResponse = {
      type: "stateUpdate",
      stateUpdate: {
        type: StateUpdateType.TurnIndicator,
        data: {
          players: this.turnOrder.map(player => player.asDTO()),
          turnIndex: this.turnIndex
        }
      }
    }
    return { tileBagUpdate, boardUpdate, rackUpdate, turnIndicatorUpdate }
  }
  private advanceTurn() {
    this.turnIndex = (this.turnIndex + 1) % this.turnOrder.length;
    console.log(this.turnIndex)
    this.turnNumber++;
    this.broadcastStates();
    this.board.print()
  }

  private gameEnd() {
    //this.lobby.closeLobby();
  }
  public getTileBag() {
    return this.tileBag;
  }


}