const output = document.getElementById('output')
const input = document.getElementById('input')
const submit = document.getElementById('submit')
const connectionStatus = document.getElementById('connectionStatus')
const turnStatus = document.getElementById('turnStatus')
const nameInput = document.getElementById('nameInput')
const playerSelect = document.getElementById('playerSelect')
const joinButton = document.getElementById('join')
const onlineList = document.getElementById('onlineList')
const persistent = document.getElementById('persistent')

const playerOptions = [1, 2, 3, 4, 5, 6]
playerOptions.forEach((player) => {
  const option = document.createElement('option')
  option.value = String(player)
  option.textContent = `Player ${player}`
  playerSelect.appendChild(option)
})

const savedName = localStorage.getItem('acquireName') || ''
const savedPlayer = localStorage.getItem('acquirePlayer') || '1'
nameInput.value = savedName
playerSelect.value = savedPlayer

let ws = null
let connected = false
const wsUrl = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.hostname}:3001/ws`

const setStatus = (text) => {
  connectionStatus.textContent = text
}

const setTurn = (state) => {
  if (!state || !state.playerTurn) {
    turnStatus.textContent = 'Turn: --'
    return
  }
  turnStatus.textContent = `Turn: Player ${state.playerTurn}`
}

const board = (boardissue, boardchains) => {
    // graphic board
    document.getElementById(`board`).innerHTML = ''
    const boardSet = new Set(boardissue)
    for (let j = 1; j <= 9; j++) {
      for (let i = 1; i <= 12; i++) {
          const thislet = String.fromCharCode(64 + j);
          const target = document.getElementById(`board`)
          const div = document.createElement("div")
          div.className = "square white"
          const thisTile = String.fromCharCode(i + 64).concat(String(j))
          if (boardSet.has(thisTile)) {
              div.className = "square black"
          }
          if (boardchains[i][j] === 'I') {
              div.className = "square imperial"
          }
          if (boardchains[i][j] === 'C') {
              div.className = "square continental"
          }
          if (boardchains[i][j] === 'A') {
              div.className = "square american"
          }
          if (boardchains[i][j] === 'F') {
              div.className = "square festival"
          }
          if (boardchains[i][j] === 'W') {
              div.className = "square worldwide"
          }
          if (boardchains[i][j] === 'L') {
              div.className = "square luxor"
          }
          if (boardchains[i][j] === 'T') {
              div.className = "square tower"
          }
          div.innerText = thisTile.concat(boardchains[i][j])
          target.appendChild(div);
        }
      }
}

const updatePresence = (players) => {
  onlineList.innerHTML = ''
  if (!players || players.length === 0) {
    const li = document.createElement('li')
    li.textContent = 'No players online yet.'
    onlineList.appendChild(li)
    return
  }
  players
    .slice()
    .sort((a, b) => (a.player || 99) - (b.player || 99))
    .forEach((player) => {
      const li = document.createElement('li')
      const label = player.player ? `Player ${player.player}` : 'Spectator'
      li.textContent = `${label} — ${player.name}`
      onlineList.appendChild(li)
    })
}

const sendMessage = (payload) => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    return
  }
  ws.send(JSON.stringify(payload))
}

const sendHello = () => {
  const name = nameInput.value.trim() || 'Guest'
  const player = Number(playerSelect.value || '1')
  localStorage.setItem('acquireName', name)
  localStorage.setItem('acquirePlayer', String(player))
  sendMessage({ type: 'hello', name, player })
}

const connect = () => {
  setStatus('Connecting...')
  ws = new WebSocket(wsUrl)

  ws.addEventListener('open', () => {
    connected = true
    setStatus('Connected')
    sendHello()
  })

  ws.addEventListener('close', () => {
    connected = false
    setStatus('Disconnected - retrying...')
    setTimeout(connect, 1500)
  })

  ws.addEventListener('error', () => {
    setStatus('Connection error')
  })

  ws.addEventListener('message', (event) => {
    let payload = null
    try {
      payload = JSON.parse(event.data)
    } catch (error) {
      return
    }

    if (payload.type === 'snapshot') {
      output.textContent = payload.output || ''
      setTurn(payload.state)
      updatePresence(payload.presence || [])
      persistent.textContent = payload.persistent || ''
      return
    }

    if (payload.type === 'output') {
      output.textContent = payload.output || ''
      persistent.textContent = payload.persistent || ''
      setTurn(payload.state)
      board(payload.boardissue, payload.boardchains)
      return
    }

    if (payload.type === 'presence') {
      updatePresence(payload.players || [])
      return
    }

    if (payload.type === 'error') {
      setStatus(`Error: ${payload.message}`)
      setTimeout(() => {
        if (connected) {
          setStatus('Connected')
        }
      }, 2000)
    }
  })
}

const runInput = () => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    setStatus('Disconnected - retrying...')
    return
  }
  const value = input.value
  sendMessage({ type: 'input', text: value })
  input.value = ''
  input.focus()
}

joinButton.addEventListener('click', sendHello)
submit.addEventListener('click', runInput)
input.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    runInput()
  }
})

connect()
input.focus()