import { Router } from "express";
import * as lobbyController from "../controllers/lobbyController";

const router = Router();

/**
 * GET /board
 * Returns the full chess board
 */
router.get("/create", lobbyController.createLobby);
router.get("/list", lobbyController.lobbyList);
router.get("/:lobbyId", lobbyController.getLobbyById);

/**
 * Get the rack of a player
 */
router.get("/:lobbyId/player/:playerId/rack", lobbyController.getPlayerRack);


/**
 * Check if its players turn
 */
router.get("/:lobbyId/player/:playerId/is-players-turn", lobbyController.isPlayersTurn);

/**
 * Get TileBag
 */
router.get("/:lobbyId/tilebag", lobbyController.getTileBag);


export default router;
