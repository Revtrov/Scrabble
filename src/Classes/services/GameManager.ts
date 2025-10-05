import { ServerResponse } from "../../websocket";
import { Board } from "../Board";
import { Lobby } from "../Lobby";
import { Player } from "../Player";
import { z } from "zod";
import { TileBag } from "../TileBag";
import { Dictionary } from "../Dictionary";

enum StateUpdateType {
  TileBag = "TileBag",
  Board = "Board",
  Rack = "Rack"
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
export interface Coord{
  i:number,
  j:number
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
  Failure = "Failure"
}

export class GameManager {
  private lobby: Lobby;
  private players: Set<Player>;
  private board: Board;
  private turnOrder: Array<Player>;
  private turnIndex: number = 0;
  private tileBag: TileBag;
  constructor(lobby: Lobby, players: Set<Player>) {
    this.lobby = lobby;
    this.players = players;
    this.turnOrder = [...this.players.values()];
    this.board = new Board()
    this.board.print()
    this.tileBag = new TileBag()
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
        turnActionResult = this.handleExchange(action.data);
        break;
      case TurnActionId.Pass:
        turnActionResult = this.handlePass(action.data);
        break;
    }
    this.lobby.sendToClient(msg.requestId, msg.clientId, turnActionResult);
    this.advanceTurn();
  }
  private handleMove(playerId: string, moveData: z.infer<typeof MoveDataSchema>): TurnActionResult {
    const { direction, startIndex, tileIds } = moveData;
    const playerRack = this.lobby.playerIdMap.get(playerId).getRack()
    if (!playerRack.hasTileIds(tileIds)) throw new Error("Used tiles not in player's Rack")
    const tiles = tileIds.map(tileId => playerRack.getTileIdMap().get(tileId));
    // this should be sorted
    const strWord = tiles.map(tile=>tile.getLetter()).join("");
    const validWord = Dictionary.hasWord(strWord);
    if(!validWord) return TurnActionResult.Failure;
    // check if connected words too
    // update board
    this.board.placeWord(direction as Direction, startIndex as Coord, tiles);
    playerRack.removeTiles(tiles);
    playerRack.fill()
    return TurnActionResult.Success;
  }

  private handleExchange(exchangeData: z.infer<typeof ExchangeDataSchema>): TurnActionResult {
    // remove tiles from rack, draw new ones from bag
    return TurnActionResult.Success;
  }

  private handlePass(_: z.infer<typeof PassDataSchema>): TurnActionResult {
    // maybe track consecutive passes to end the game
    this.advanceTurn();
    return TurnActionResult.Success;
  }
  private advanceTurn() {
    this.turnIndex = (this.turnIndex + 1) % this.turnOrder.length;
    const tileBagUpdate: ServerResponse = {
      type: "stateUpdate",
      stateUpdate: {
        type: StateUpdateType.TileBag,
        data: {
          tileBag: this.tileBag.asDTO()
        }
      }
    }
    this.lobby.broadcast(tileBagUpdate);
    const boardUpdate: ServerResponse = {
      type: "stateUpdate",
      stateUpdate: {
        type: StateUpdateType.Board,
        data: {
          board: this.board.asDTO()
        }
      }
    }
    this.lobby.broadcast(boardUpdate);
    const rackUpdate: ServerResponse = {
      type: "stateUpdate",
      stateUpdate: {
        type: StateUpdateType.Rack,
        data: null
      }
    }
    this.lobby.broadcast(rackUpdate);
    this.board.print()
  }

  private gameEnd() {
    //this.lobby.closeLobby();
  }
  public getTileBag() {
    return this.tileBag;
  }


}