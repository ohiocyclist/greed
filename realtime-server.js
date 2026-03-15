const http = require('http')
const crypto = require('crypto')
const WebSocket = require('ws')
const AcquireGame = require('./acquirecommon')

const game = new AcquireGame.AcquireGame('server')
let lastOutput = game.textBack

const clients = new Map()

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'text/plain' })
    res.end('ok')
    return
  }
  res.writeHead(404, { 'content-type': 'text/plain' })
  res.end('not found')
})

const wss = new WebSocket.Server({ server, path: '/ws' })

const getState = () => ({
  playerTurn: game.playerTurn,
  playerPhase: game.playerPhase,
  numPlayers: game.numPlayers
})

const presencePayload = () =>
  Array.from(clients.values()).map((client) => ({
    id: client.id,
    name: client.name,
    player: client.player,
    lastSeen: client.lastSeen
  }))

const broadcast = (type, payload) => {
  const message = JSON.stringify({ type, ...payload })
  for (const socket of wss.clients) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(message)
    }
  }
}

const sendPresence = () => {
  broadcast('presence', { players: presencePayload() })
}

const sendError = (ws, message) => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'error', message }))
  }
}

const buildOutputForClient = (client) => {
  if (!client?.player || client.player < 1 || client.player > game.numPlayers) {
    // Spectator or not joined
    return {
      output: lastOutput,
      persistent: 'Spectating',
      hand: [],
      stocks: {},
      funds: 0
    }
  }
  // Show hand and stocks for this player
  const hand = Array.from(game.playerBags[client.player] || []).sort()
  const stocks = { ...game.playerStocks[client.player] }
  const funds = game.playerFunds[client.player]
  const persistent = `Holding: Funds: $${game.playerFunds[client.player]}\nStocks:\n${game.playerStockHoldings(false, client.player)}\nTiles:\n${hand}\n\nPrices:\n${game.calcStocks()}`
  // Build output string (with their own hand and stocks)
  let output = lastOutput
  if (client?.player == game.playerTurn && game.secretMessage.length > 2) {
      output = game.secretMessage
  }
  let boardissue = Array.from(game.boardTiles)
  let boardchains = game.boardChains
  return { output, persistent, boardissue, boardchains }
}

const buildOutputForClientSimple = (client) => {
    // just two equals
	if (client?.player == game.playerTurn && game.secretMessage.length > 2) {
		return {
		  output: game.secretMessage,
		  hand: Array.from(game.playerBags[client.player] || []).sort(),
		  stocks: {},
		  funds: 0
		}
	} else {
		return {
		  output: lastOutput,
		  hand: [],
		  stocks: {},
		  funds: 0
		}
	}
}
  
wss.on('connection', (ws) => {
  const client = {
    id: crypto.randomUUID(),
    name: 'Guest',
    player: null,
    lastSeen: new Date().toISOString()
  }
  clients.set(ws, client)

  ws.send(JSON.stringify({ type: 'snapshot', output: lastOutput, state: getState(), presence: presencePayload() }))
  sendPresence()

  ws.on('message', (data) => {
    let payload = null
    try {
      payload = JSON.parse(String(data))
    } catch (error) {
      sendError(ws, 'Invalid message.')
      return
    }

    const type = payload?.type
    client.lastSeen = new Date().toISOString()

    if (type === 'hello') {
      const name = String(payload.name || '').trim() || 'Guest'
      const player = Number(payload.player)
      if (!Number.isInteger(player) || player < 1 || player > 6) {
        sendError(ws, 'Pick a player number from 1-6.')
        return
      }
      for (const existing of clients.values()) {
        if (existing.id !== client.id && existing.player === player) {
          sendError(ws, `Player ${player} is already taken.`)
          return
        }
      }
      client.name = name
      client.player = player
      sendPresence()
      return
    }

    if (type === 'input') {
      if (!client.player) {
        sendError(ws, 'Join as a player before sending moves.')
        return
      }
      if (game.playerPhase === game.mergerSellBackPhase || game.playerPhase === game.mergerTradeInPhase) {
        if (game.currentTradePlayer !== client.player) {
            sendError(ws, `We are closing a merger and need input from Player ${game.currentTradePlayer}.`)
            return
        }
      } else {
        if (game.playerTurn !== client.player) {
            sendError(ws, `Not your turn. It is Player ${game.playerTurn}.`)
            return
        }
    }
      const text = String(payload.text || '')
      const output = game.stepThrough(text)
      lastOutput = output
      for (const socket of wss.clients) {
		  if (socket.readyState !== WebSocket.OPEN) continue
		  const target = clients.get(socket)
		  const personalized = buildOutputForClient(target)
		  socket.send(JSON.stringify({ type: 'output', ...personalized, state: getState() }))
	  }
      return
    }

    if (type === 'ping') {
      return
    }
  })

  ws.on('close', () => {
    clients.delete(ws)
    sendPresence()
  })
})

const port = Number(process.env.PORT || 3001)
server.listen(port, () => {
  console.log(`Acquire realtime server listening on ${port}`)
})
