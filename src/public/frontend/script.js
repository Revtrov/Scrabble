import { GameManager } from "./Services/GameManager.js";

const main = async()=>{
  const gameManager = new GameManager()
  await gameManager.beginGame();
}
main();