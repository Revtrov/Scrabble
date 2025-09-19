import { Bag } from "./Components/Bag/Bag.js";
import { Board } from "./Components/Board/Board.js"

const main = ()=>{
  const sideLength = 15
  const bag = new Bag(document.querySelector(".LeftSide"))
  const board = new Board(document.body, sideLength);
}
main();