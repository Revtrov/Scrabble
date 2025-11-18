export class SessionConfigurationModal {
  constructor(_parentElement, _sessionManager, _lobbies, _refetchCallback) {
    this.parentElement = _parentElement;
    this.sessionManager = _sessionManager
    this.lobbies = null;
    this.fragment = document.createDocumentFragment();

    setInterval(async () => await this.loadList(_refetchCallback), 300);
    this.sessionModalBackgroundDim = document.createElement("div")
    this.sessionModalBackgroundDim.classList.add("sessionModalBackgroundDim")

    this.root = document.createElement("div")
    this.root.classList.add("sessionModal")

    this.title = document.createElement("div")
    this.title.classList.add("title");
    this.title.innerText = "LOBBY"
    this.root.appendChild(this.title)

    this.lobbyList = document.createElement("div")
    this.lobbyList.classList.add("lobbyList")

    this.root.appendChild(this.lobbyList)

    this.joinContainer = document.createElement("div");
    this.joinContainer.classList.add("joinContainer")

    this.lobbyIdInput = document.createElement("input")
    this.lobbyIdInput.classList.add("lobbyIdInput")
    this.lobbyIdInput.placeholder = "Lobby Code"
    this.joinContainer.appendChild(this.lobbyIdInput)

    this.joinLobbyButton = document.createElement("button")
    this.joinLobbyButton.classList.add("joinLobbyButton")
    this.joinLobbyButton.textContent = "Join Lobby"
    let joinClicked = false
    this.joinLobbyButton.onclick = async () => {
      if (!joinClicked) {
        const success = await this.sessionManager.joinSession(this.lobbyIdInput.value);
        if (!success) throw new Error("Session was not found")
      }
      joinClicked = true;
    }
    this.joinContainer.appendChild(this.joinLobbyButton)

    this.root.appendChild(this.joinContainer)

    this.createLobbyButton = document.createElement("button")
    this.createLobbyButton.classList.add("createLobbyButton")
    this.createLobbyButton.textContent = "Create Lobby"
    let createClicked = false
    this.createLobbyButton.onclick = async () => {
      if (!createClicked) {
        const success = await this.sessionManager.createSession();
        if (!success) throw new Error("Session was not made")
      }
      createClicked = true;
    }
    this.root.appendChild(this.createLobbyButton)

    this.fragment.appendChild(this.sessionModalBackgroundDim)
    this.fragment.appendChild(this.root)
    this.parentElement.appendChild(this.fragment)
  }
  async loadList(_refetchCallback) {
    const newList = await _refetchCallback();
    if (JSON.stringify(newList) !== JSON.stringify(this.lobbies)) {
      this.lobbyList.innerHTML = ""
      this.lobbyElements = []
      this.lobbies = newList
    } else {
      return
    }

    for (const lobbie of this.lobbies) {
      const lobbyListItem = document.createElement("div")
      lobbyListItem.classList.add("lobbyListItem")

      const lobbyListItemCode = document.createElement("div");
      lobbyListItemCode.classList.add("code")
      lobbyListItemCode.innerText = lobbie.id
      lobbyListItem.appendChild(lobbyListItemCode)

      const lobbyListItemPlayerCount = document.createElement("div");
      lobbyListItemPlayerCount.innerText = `${lobbie.clientCount}/${lobbie.maxClientCount}`
      lobbyListItem.appendChild(lobbyListItemPlayerCount)
      lobbyListItemPlayerCount.classList.add("playerCount")

      this.lobbyElements.push(lobbyListItem)
      this.lobbyList.appendChild(lobbyListItem)
      let joinClicked = false;
      lobbyListItem.onclick = async () => {
        if (!joinClicked) {
          const success = await this.sessionManager.joinSession(lobbie.id);
          if (!success) throw new Error("Session was not found")
        }
        joinClicked = true;
      }
    }
  }
}