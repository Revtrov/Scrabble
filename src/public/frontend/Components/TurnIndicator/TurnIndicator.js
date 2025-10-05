export class TurnIndicator {
  constructor(_parentElement) {
    this.parentElement = _parentElement;
    this.fragment = document.createDocumentFragment();

    this.root = document.createElement("div");
    this.root.classList.add("TurnIndicator");

    this.fragment.appendChild(this.root)
    this.parentElement.appendChild(this.fragment)
  }
  async updateState(msg){
    console.log(msg)
    if(!msg?.stateUpdate) throw new Error("msg is not state update");
    if(!msg?.stateUpdate?.data) throw new Error("msg missing data");
    if(!msg?.stateUpdate?.data.players) throw new Error("no players found");
    if(msg?.stateUpdate?.data.turnIndex == null) throw new Error("no turnIndex found");
    this.root.innerHTML = "";
    for(let i = 0; i < msg.stateUpdate.data.players.length;i++){
      const player  = document.createElement("div");
      player.classList.add("Player");
      if(i == msg.stateUpdate.data.turnIndex) player.classList.add("IsTurn");
      player.innerText = `Player: ${i+1}`;
      this.root.appendChild(player);
    }
  }
}