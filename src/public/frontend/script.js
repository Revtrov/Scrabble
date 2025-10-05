import { GameManager } from "./Services/GameManager.js";

const main = async()=>{
  await GameManager.beginGame();
}
main();