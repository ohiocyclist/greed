class AcquireGame {
	// Greeting message moved to HTML
    textBack = 'Input number of players (2-6)\n\n' //'Greed (Acquire) -- a game for up to six players where you control the board by stock trading\n\nInput number of players (2-6)\n\n'
	// Chains, board state control variables
    chains = ['Imperial', 'Continental', 'American', 'Festival', 'Worldwide', 'Tower', 'Luxor']
    chainsOnBoard = Array(7).fill(0)
    chainSharesBank = Array(7).fill(25)
    playerFunds = Array(7).fill(0) // counts from 1 (like Player 1)
    playerStocks = []
    playerPhase = 0
    stockBuy = 0
	// allow players to buy any combination of 3 stocks per turn
    stockLeft = 3
    stockPrices = Array(7).fill(0)
	// 2-6 players; 7 indicates not chosen
    numPlayers = 7
    playerTurn = 1
	// set if the game ending criteria are met
    canEndGame = false
    tileBag = new Set()
    boardTiles = new Set()
    boardChains = [] // counts from 1 (like the board)
    playerBags = new Set() // counts from 1 (like Player 1)
    // player Phases
    hideWarnPhase = 0
    tilesPhase = 1
    stockRequestPhase = 2
    stockBuyingPhase = 3
    noStockPhase = 4
    mergerTradeInPhase = 5
    mergerSellBackPhase = 6
    closeMergerPhase = 7
    selectChainPhase = 8
    selectSurvivorPhase = 9
	// merger control variables
    numTradePlayers = 0
    currentTradePlayer = 0
    mergerReport = ''
    defunct = []
    defunctpos = 0
    survivorLetter = ''
    mergerTile = ''
    maxtrade = 0
	// push a message to the next phase
    carryOverMessage = ''
    maxSellShares = 0
    chainsToCreate = []
    topChains = []

    drawTile() {
		// remove a tile from the tile bag (if possible) and hand to a player
		// return '' for no tiles left
        if (this.tileBag.size === 0) {
            return ''
        }

        const elements = Array.from(this.tileBag)
        const randomIndex = Math.floor(Math.random() * elements.length)
        const randomElement = elements[randomIndex]
        this.tileBag.delete(randomElement)
        return randomElement
    }

    clearboard() {
		// remove all tiles from the board when starting the game
        const elements = Array.from(this.boardTiles)
        for (let i = 0; i < elements.length; i++) {
            this.boardTiles.delete(elements[i])
        }
    }

    setup() {
		// put all tiles back in the bag when starting over
		this.chainsOnBoard = Array(7).fill(0)
		this.chainSharesBank = Array(7).fill(25)
        let startTileBag = []
        this.clearboard()
		// remove all board chain affiliations
        // we start counting at 1
		this.boardChains = []
        this.boardChains.push([])
        for (let i = 1; i < 13; i++) {
            this.boardChains.push([' '])
            for (let j = 1; j < 10; j++) {
                this.boardChains[i].push(' ')
                startTileBag.push(String.fromCharCode(i + 64).concat(String(j)))
            }
        }
        this.tileBag = new Set(startTileBag)
        this.numPlayers = 7
        // set player stocks to zero
        // really starts from 1
        for (let i = 0; i < 7; i++) {
            const stockobj = {}
            for (let j = 0; j < this.chains.length; j++) {
                stockobj[this.chains[j]] = 0
            }
            this.playerStocks[i] = stockobj
        }
    }

    showPlayerTiles() {
		// display the tile board to the player whose turn it is
        const thisboard = String(Array.from(this.playerBags[this.playerTurn]).sort().join(', '))
        return thisboard
    }

    startgame() {
		// draw starting tiles and give players their money
        this.textBack = '' //'Greed (Acquire) -- a game for up to six players where you control the board by stock trading\n\n'
        for (let i = 0; i < this.numPlayers; i++) {
            const drawnTile = this.drawTile()
            this.boardTiles.add(drawnTile)
            // board test set to Imperial Chain
            // this.boardChains[drawnTile[0].charCodeAt(0) - 64][Number(drawnTile[1])] = 'I'
        }
        for (let k = 1; k <= this.numPlayers; k++) {
            this.playerFunds[k] = 6000
            this.playerBags[k] = new Set()
            for (let l = 0; l < 6; l++) {
                const drawnTile = this.drawTile()
                if (drawnTile !== '') {
                    this.playerBags[k].add(drawnTile)
                }
            }
            // let sortedBoard = Array.from(this.playerBags[k]).sort()
        }
		// start with player 1
		this.playerTurn = 1
    }

    board() {
		// display the board on the screen
        let thisboard = '    '
        // draw the frame
        for (let i = 1; i < 13; i++) {
            thisboard = thisboard.concat(' ', String.fromCharCode(i + 64), '    ')
        }
        thisboard = thisboard.concat('\n\n')
		// draw all the tile locations, '.' for no tile, chain affiliation afterwards if present
		// start from 1
        for (let j = 1; j < 10; j++) {
            thisboard = thisboard.concat(' ', String(j), '  ')
            for (let i = 1; i < 13; i++) {
				// translate 'i' into a letter
                const thisTile = String.fromCharCode(i + 64).concat(String(j))
                if (this.boardTiles.has(thisTile)) {
                    thisboard = thisboard.concat(' ', thisTile, ' ', this.boardChains[i][j], ' ')
                } else {
                    thisboard = thisboard.concat(' .    ')
                }
            }
            thisboard = thisboard.concat('\n\n')
        }

        //return thisboard
      // graphic board
      document.getElementById(`board`).innerHTML = ''
      for (let j = 1; j <= 9; j++) {
        for (let i = 1; i <= 12; i++) {
            const thislet = String.fromCharCode(64 + j);
            const target = document.getElementById(`board`)
            const div = document.createElement("div")
            div.className = "square white"
            const thisTile = String.fromCharCode(i + 64).concat(String(j))
            if (this.boardTiles.has(thisTile)) {
	        div.className = "square black"
            }
            if (this.boardChains[i][j] === 'I') {
                div.className = "square imperial"
            }
            if (this.boardChains[i][j] === 'C') {
                div.className = "square continental"
            }
            if (this.boardChains[i][j] === 'A') {
                div.className = "square american"
            }
            if (this.boardChains[i][j] === 'F') {
                div.className = "square festival"
            }
            if (this.boardChains[i][j] === 'W') {
                div.className = "square worldwide"
            }
            if (this.boardChains[i][j] === 'L') {
                div.className = "square luxor"
            }
            if (this.boardChains[i][j] === 'T') {
                div.className = "square tower"
            }
            div.innerText = thisTile.concat(this.boardChains[i][j])
            target.appendChild(div);
         }
        }
        return ''
    }

    adjacent(tile1, tile2) {
		// check if tile1 and tile2 are adjacent to each other (diagonals don't count)
		// return true if adjacent
		// horizontal
        if (tile1[0] === tile2[0] && (Number(tile1[1]) === 1 + Number(tile2[1]) || Number(tile1[1]) + 1 === Number(tile2[1]))) {
            return true
        }
		// vertical
        if (tile1[1] === tile2[1]) {
            if (tile1[0].charCodeAt(0) - 64 === tile2[0].charCodeAt(0) - 63 || 
                tile1[0].charCodeAt(0) - 63 === tile2[0].charCodeAt(0) - 64 
                ) {
                    return true
            }
        }
        return false
    }

    eventualAdjacents(tile) {
        // return all connected tiles
		// brute force check all the tiles on the board; it's inefficient but we have the cycles
        const onboards = Array.from(this.boardTiles)            
		// consider a tile adjacent to itself
        const allConnected = [tile]
        let prevlength = -1
		// keep searching for more adjacent tiles until the list stops growing
        while (allConnected.length > prevlength) {
            prevlength = allConnected.length
            for (let i = 0; i < onboards.length; i++) {
                for (let j = 0; j < allConnected.length; j++) {
                    if (!allConnected.includes(onboards[i]) && this.adjacent(allConnected[j], onboards[i])) {
                        allConnected.push(onboards[i])
                    }
                }
            }
        }
        return allConnected
    }

    allChains(allConnected) {
		// get all the chains present in the current blob of tiles (i.e. check for merger)
        const adjacentChains = []
        for(let i = 0; i < allConnected.length; i++) {
            const curChain = this.boardChains[allConnected[i][0].charCodeAt(0) - 64][Number(allConnected[i][1])]
            if (curChain != ' ' && !adjacentChains.includes(curChain)) {
                adjacentChains.push(curChain)
            }
        }
        return adjacentChains
    }

    stockPriceCalc(size, chain) {
		// Calculate how much stocks cost given the chain and chain size
        // merger bonuses come from here too, 10x for 1st, 5x for 2nd, both 7.5x for combo 1st/2nd, both 2.5x for combo 2nd/3rd, round up to $100 for screwball
        chain = chain[0]
        let booster = 0
        if (chain === 'W' || chain === 'F' || chain === 'A') {
            booster = 1
        }
        if (chain === 'C' || chain === 'I') {
            booster = 2
        }
        if (size > 40) {
            return (booster + 10) * 100
        }
        if (size > 30) {
            return (booster + 9) * 100
        }
        if (size > 20) {
            return (booster + 8) * 100
        }
        if (size > 10) {
            return (booster + 7) * 100
        }
        if (size > 6) {
            return (booster + 6) * 100
        }
        return (booster + size) * 100
    }

    countSize(chain) {
		// find out how many tiles are marked for a given chain
        let mysize = 0
        chain = chain[0]
        for (let i = 1; i < this.boardChains.length; i++) {
            for (let j = 1; j < this.boardChains[i].length; j++) {
                if (this.boardChains[i][j] === chain) {
                    mysize = mysize + 1
                }
            }
        }
        return mysize
    }

    calcStocks() {
		// return the blurb on screen for the stock price calc, and whether a chain is safe and has shares left to buy
        let stockBlurb = ''
        for (let i = 0; i < this.chains.length; i++) {
            const mysize = this.countSize(this.chains[i])
            if (mysize > 0) {
                const oneStock = this.stockPriceCalc(mysize, this.chains[i][0])
                this.stockPrices[i] = oneStock
				// justify these to each other in monospace font
                let spacer = ''
                if (this.chains[i].length < 8) {
                    spacer = '   \t'
                }
                if (this.chains[i].length > 7) {
                    spacer = spacer.concat('\t')
                }
                if (mysize > 10) {
                    spacer = spacer.concat('(safe)')
                } else {
                    spacer = spacer.concat('      ')
                }
                stockBlurb = stockBlurb.concat(this.chains[i], spacer, '\tcosts $', String(oneStock), ', ', String(this.chainSharesBank[i]), ' left to buy\n')
            }
        }
        return stockBlurb
    }

    playerStockHoldings(hideval, playerStock=this.playerTurn) {
		// display which firms a player is holding
		// if hideval is false (i.e. they're looking at their own hand rather than a global display) also display the counts
        let stockBlurb = ''
        for (let i = 0; i < this.chains.length; i++) {
            const stockamt = this.playerStocks[playerStock][this.chains[i]]
            if (stockamt > 0) {
                if (hideval) {
                    stockBlurb = stockBlurb.concat('Some ', this.chains[i], '\n')
                } else {
                    stockBlurb = stockBlurb.concat(String(stockamt), ' of ', this.chains[i], '\n')
                }
            }
        }
        if (stockBlurb.length < 2) {
            stockBlurb = 'No Stocks\n'
        }
        stockBlurb = stockBlurb.concat('\n')
        return stockBlurb
    }

    constructor() {
		this.setup()
    }

    chainFind(chainLetter) {
		// turn a starting letter for a chain into the index in the array where that firm is
		// used to control things like the number of shares in the bank
		// return -1 for bad letter
        let chainIndex = -1 
        for (let i = 0; i < this.chains.length; i++) {
            if (this.chains[i][0] === chainLetter) {
                chainIndex = i
                break
            }
        }
        return chainIndex
    }

    awardBonus(chainLetter) {
		// both create the message for winners in a merger and actually pay them
		// run once per defunct chain
        const chainIndex = this.chainFind(chainLetter)
        if (chainIndex === -1) {
            return ''
        }
		// find the bonus and the winner(s)
        const size = this.countSize(chainLetter)
        const price = this.stockPriceCalc(size, chainLetter)
        const majority = price * 10
        const minority = price * 5
        const holdings = []
        for (let p = 1; p <= this.numPlayers; p++) {
            holdings.push({ player: p, shares: this.playerStocks[p][this.chains[chainIndex]] })
        }
        holdings.sort((a, b) => b.shares - a.shares)
        const top = holdings[0].shares
        if (top === 0) {
            return ''
        }
        const topPlayers = holdings.filter((h) => h.shares === top).map((h) => h.player)
        const second = holdings.find((h) => h.shares < top)?.shares || 0
        const secondPlayers = holdings.filter((h) => h.shares === second && second > 0).map((h) => h.player)

        let report = `Bonuses for ${this.chains[chainIndex]}:\n\n`
		// split first and second if there are more than one first or no seconds
		// cash holdings after receiving the bonus is public information
        if (topPlayers.length > 1 || secondPlayers.length === 0) {
            const total = majority + minority
            const split = Math.ceil(total / topPlayers.length / 100) * 100
            report += `tie for majority, (${top} shares) $${split} each.\n`
            for (const player of topPlayers) {
                this.playerFunds[player] += split
                report += `Player ${player} majority $${split}.  They now hold $${this.playerFunds[player]}\n`
            }
            return report
        }

        this.playerFunds[topPlayers[0]] += majority
        report += `Player ${topPlayers[0]} majority $${majority}, (${top} shares).  They now hold $${this.playerFunds[topPlayers[0]]}\n`
        if (topPlayers.length > 1) {
            for (let i = 1; i < topPlayers.length; i++) {
                report += `Player ${topPlayers[i]} majority $${majority}.  They now hold $${this.playerFunds[topPlayers[i]]}\n`
            }
        }
		// pay second place player(s)
        if (secondPlayers.length > 1) {
            const split = Math.ceil(minority / secondPlayers.length / 100) * 100
            report += `Minority tie $${split} each (${second} shares).\n`
            for (const player of secondPlayers) {
                this.playerFunds[player] += split
                report += `Player ${player} minority $${split}.  They now hold $${this.playerFunds[player]}\n`
            }
            return report
        }
        if (secondPlayers.length === 1) {
            this.playerFunds[secondPlayers[0]] += minority
            report += `Player ${secondPlayers[0]} minority $${minority}, (${second} shares).  They now hold $${this.playerFunds[secondPlayers[0]]}\n`
            return report
        }
        report += '\n'
        return report
    }  

    twoForOneOptions() {
		// offer to allow players to trade defunct shares two for one for active shares
		// limit by number of shares in the bank
		// even if players have no shares, make them enter '0'
        const mydefunct = this.chains[this.chainFind(this.defunct[this.defunctpos])]
        this.maxtrade = Math.floor(this.playerStocks[this.currentTradePlayer][mydefunct] / 2)
        const totTrade = this.chainSharesBank[this.chainFind(this.survivorLetter)]
        if (this.maxtrade > totTrade) {
            this.maxtrade = totTrade
        }
        if (this.maxtrade === 0) {
            return `Player ${this.currentTradePlayer}, you do not have the ability to trade ${mydefunct} shares 2-for-1 for `.concat(
                `${this.chains[this.chainFind(this.survivorLetter)]} shares.  There are ${this.chainSharesBank[this.chainFind(this.survivorLetter)]} shares in the bank.`,
                ` Type '0' to continue.`)
        }
        return `Player ${this.currentTradePlayer}, you may trade up to ${this.maxtrade * 2} of your ${this.playerStocks[this.currentTradePlayer][mydefunct]} `.concat(
            `${mydefunct} shares 2-for-1 for ${this.maxtrade} ${this.chains[this.chainFind(this.survivorLetter)]} shares.  There are `,
            `${this.chainSharesBank[this.chainFind(this.survivorLetter)]} shares in the bank.  How many ${this.chains[this.chainFind(this.survivorLetter)]}`,
            ` shares would you like to receive?\n`)
    }

    sellBackPrompt() {
		// call once per chain made defunct by a merger, offer to let players sell shares back
        let msg = this.preSellDefunct(this.defunct[this.defunctpos], this.currentTradePlayer)
        return msg
    }

    preSellDefunct(chainLetter, playerIndex) {
		// tell players the terms for selling defunct shares back to the bank
		// or holding them (if they prefer)
        const chainIndex = this.chainFind(chainLetter)
        const size = this.countSize(chainLetter)
        const price = this.stockPriceCalc(size, chainLetter)
        const shares = this.playerStocks[playerIndex][this.chains[chainIndex]]
        this.maxSellShares = shares        
        if (shares <  1) {
            return `Player ${playerIndex}, you have no shares of ${this.chains[chainIndex]} to sell back.  Enter '0'.`
        }
        return `Player ${playerIndex}, you can sell up to ${shares} ${this.chains[chainIndex]} at ${price} each.  How many would you like to sell?`
    }

    sellDefunct(chainLetter, playerIndex, amount) {
		// sell shares back to the bank in a merger; some safeguarding for not selling more shares than you have
        if (amount === 0) {
            return ''
        }
        const chainIndex = this.chainFind(chainLetter)
        const size = this.countSize(chainLetter)
        const price = this.stockPriceCalc(size, chainLetter)
        const shares = this.playerStocks[playerIndex][this.chains[chainIndex]]
        if (shares <  1 || shares < amount) {
            return `Error in selling shares, not enough shares to sell, asked to sell ${amount} only have ${shares}`
        }
        this.playerFunds[playerIndex] += amount * price
        this.chainSharesBank[chainIndex] += amount
        this.playerStocks[playerIndex][this.chains[chainIndex]] = this.playerStocks[playerIndex][this.chains[chainIndex]] - amount
        return `Player ${playerIndex} sold ${amount} shares of ${this.chains[chainIndex]} for ${amount * price} and now has ${this.playerFunds[playerIndex]}`
    }

    autoSellDefunct(chainLetter) {
		// sell all shares (at the end of the game)
        const chainIndex = this.chainFind(chainLetter)
        const size = this.countSize(chainLetter)
        const price = this.stockPriceCalc(size, chainLetter)
        for (let p = 1; p <= this.numPlayers; p++) {
        const shares = this.playerStocks[p][this.chains[chainIndex]]
        if (shares > 0) {
            this.playerFunds[p] += shares * price
            this.chainSharesBank[chainIndex] += shares
            this.playerStocks[p][this.chains[chainIndex]] = 0
        }
        }
    }

    normalizeChainInput(input) {
		// So if you enter imperial we just want I
        return String(input || '').trim().toUpperCase()[0]
    }

    handleStockChain(input) {
		// buy a stock (if possible)
        const pick = this.normalizeChainInput(input)
        const chainIndex = this.chainFind(pick)
        if (chainIndex === -1) {
            return `Choose a valid chain: ${this.chains.join(', ')}\n`
        }
        const chainLetter = this.chains[chainIndex][0]
        const size = this.countSize(chainLetter)
        if (size === 0) {
            return 'That chain is not on the board.\n'
        }
        if (this.chainSharesBank[chainIndex] < this.stockBuy) {
            return 'Bank does not have that many shares.\n'
        }
        const price = this.stockPriceCalc(size, chainLetter)
        const totalCost = price * this.stockBuy
        if (this.playerFunds[this.playerTurn] < totalCost) {
            return 'Insufficient funds need '.concat(String(totalCost), ' have ', this.playerFunds[this.playerTurn], '.\n')
        }
        this.playerFunds[this.playerTurn] -= totalCost
        this.playerStocks[this.playerTurn][this.chains[chainIndex]] += this.stockBuy
        this.chainSharesBank[chainIndex] -= this.stockBuy
        const stockBuyLocal = this.stockBuy
        this.stockBuy = 0
        return 'Successfully bought '.concat(String(stockBuyLocal), ' shares of ', this.chains[chainIndex])
    }

    safeChainChecker(tile) {
		// check if a merger tile is between two safe chains
        // return true for ok to play, false for merging safe chains
        const adjacents = this.eventualAdjacents(tile)
        const adjacentChains = this.allChains(adjacents)
        if (adjacentChains.length < 2) {
            return true
        }
        let safeChains = 0
        for (let i = 0; i < adjacentChains.length; i++) {
            if (this.countSize(adjacentChains[i]) > 10) {
                safeChains = safeChains + 1
            }
        }
        if (safeChains > 1) {
            return false
        }
        return true
    }

    nextTurn() {
		// advance to the next player start of turn
        this.playerPhase = this.tilesPhase
        this.playerTurn = this.playerTurn + 1
        if (this.playerTurn > this.numPlayers) {
            this.playerTurn = 1
        }
    }

    startStockBuy(inputval) {
		// prompt player if they would like to buy stocks (3, minus any they have bought this turn)
        this.boardTiles.add(inputval)
        this.playerBags[this.playerTurn].delete(inputval)
        const drawnTile = this.drawTile()
        if (drawnTile !== '') {
            this.playerBags[this.playerTurn].add(drawnTile)
        }
        if (this.playerFunds[this.playerTurn] < 200) {
            const holdTurn = this.playerTurn
            this.nextTurn()
            return `${this.textBack}${this.board()}\n\nPlayer ${holdTurn} has too little money to buy stocks hit enter\n`
        }
        // would like a nice sum function.....
        if (this.chainsOnBoard.reduce((acc, cur) => {return acc + cur}, 0) === 0) {
            this.playerPhase = this.noStockPhase
            return this.textBack.concat(this.board(), '\n\nNo stocks available to buy\n\nHolding Money $', String(this.playerFunds[this.playerTurn]), '\n\nHit enter to continue\n\n')
        }
        const stockprices = this.calcStocks()
        return this.textBack.concat(this.board(), `\n\nPlayer ${this.playerTurn} played tile `, inputval, '\n\n', stockprices, '\n\nHolding Money $', String(this.playerFunds[this.playerTurn]),
            '\n\n', this.playerStockHoldings(true), '\n\nBuy how many shares of a single stock type? (0-', String(this.stockLeft), ')\n\n')
    }
	
	getPlayers(inputval) {
		// get the number of players from the user and start player 1's turn
		let innum = Number(inputval)
		if (innum > 1 && innum < 7) {
			this.numPlayers = innum
			this.startgame()
			this.playerPhase = this.tilesPhase
			return this.textBack.concat('Player ', String(this.playerTurn), ' make sure nobody else is looking and hit enter to see your tiles')
		}
		return this.textBack.concat('Please enter a number between 2 and 6')
	}
	
	gameOver() {
		// perform the final count-ups to close out the game and display the final standings
		let endmsg = 'The Game Has Ended.  Closing Out the Final Chains\n\n'
		for (let i = 0; i < this.chainsOnBoard.length; i++) {
			if (this.chainsOnBoard[i] === 1) {
				endmsg += this.awardBonus(this.chains[i][0]) + '\n\n'
				this.autoSellDefunct(this.chains[i][0])
			}
		}
		endmsg += 'Final Standings:\n\n'
		// starts from 1
		for (let i = 1; i <= this.numPlayers; i++) {
			endmsg += `Player ${i}, funds $${this.playerFunds[i]}\n`
		}
		// need this to survive setup
		let holdBoard = this.board()
		this.setup()
		return this.textBack.concat(holdBoard, endmsg, '\nInput Number of players (2-6)')		
	}
	
	selectValidateChain(inputval) {
		// allow the player to select what chain they would like to create, if there are two or more options available
		// check for validity
		let valid = -1
		inputval = inputval[0].toUpperCase()
		for (let i = 0; i < this.chainsToCreate.length; i++) {
			if (inputval === this.chains[this.chainsToCreate[i]][0]) {
				valid = this.chainsToCreate[i]
			}
		}
		if (valid === -1) {
			let message = '\nThat is not a valid letter for a firm you can create, try one of '
			for (let i = 0; i < this.chainsToCreate.length; i++) {
				let spacer = ', '
				if (i === 0) {
					spacer = ''
				}
				message += spacer.concat(this.chains[this.chainsToCreate[i]])
			}
			return this.textBack.concat(this.board(), message)
		}
		// be sure the new chain takes all adjacent tiles
		this.playerPhase = this.stockRequestPhase
		this.chainsOnBoard[valid] = 1
		this.boardChains[this.mergerTile[0].charCodeAt(0) - 64][Number(this.mergerTile[1])] = this.chains[valid][0]
		const adjacents = this.eventualAdjacents(this.mergerTile)
		for (let j = 0; j < adjacents.length; j++) {
			this.boardChains[adjacents[j][0].charCodeAt(0) - 64][Number(adjacents[j][1])] = this.chains[valid][0]
		}
		// bonus the player a share as a creation bonus (if available)
		if (this.chainSharesBank[valid] > 0) {
			this.playerStocks[this.playerTurn][this.chains[valid]] = this.playerStocks[this.playerTurn][this.chains[valid]] + 1
			this.chainSharesBank[valid] = this.chainSharesBank[valid] - 1
		}
		// start stock buying
		return this.startStockBuy(this.mergerTile)		
	}
	
	selectValidateSurvivor(inputval) {
		// if there are multiple same size chains in a merger, get the user to select one to survive
		inputval = inputval[0].toUpperCase()
		let valid = -1
		for (let i = 0; i < this.topChains.length; i++) {
			if (this.topChains[i] === inputval) {
				valid = i
				break
			}
		}
		if (valid === -1) {
			return this.textBack.concat(this.board(), 'More than one chain has the top size this merger.  Please select surviving chain first letter from among ', 
					this.topChains.map(c => this.chains[this.chainFind(c)]).join(", "))
		}
		this.survivorLetter = this.topChains[valid]
		const adjacents = this.eventualAdjacents(this.mergerTile)
		const adjacentChains = this.allChains(adjacents)
		this.defunct = adjacentChains.filter((c) => c !== this.survivorLetter)
		let report = 'Merger Triggered of '.concat(String(this.chains[this.chainFind(this.defunct[0])]), ' into ', this.chains[this.chainFind(this.survivorLetter)], ' By tile ', this.mergerTile, '\n\n')
		this.playerPhase = this.mergerTradeInPhase
		this.numTradePlayers = 0
		this.currentTradePlayer = this.playerTurn
		this.defunctpos = 0
		report += this.awardBonus(this.defunct[this.defunctpos])

		// move on to the next stage of the merger
		return this.textBack.concat(this.board(), report, '\n', this.twoForOneOptions())		
	}
	
	playTile(inputval) {
		this.stockLeft = 3
		this.playerPhase = this.stockRequestPhase
		// check for adjacency with any board tile
		const adjacents = this.eventualAdjacents(inputval)
		const adjacentChains = this.allChains(adjacents)
		// if there is an adjacent tile and no chain, assign a chain and give a creation bonus.  If there is an adjacent tile with one chain, assign that chain.
		// if there are two or more adjacent chains, it's a merger!
		//console.log('Adjacents', adjacents, adjacentChains)
		if (adjacents.length > 1 && adjacentChains.length === 0) { // create chain
			this.chainsToCreate = []
			for (let i = 0; i < 7; i++) {
				if (this.chainsOnBoard[i] === 0) {
					this.chainsToCreate.push(i)
				}
			}
			if (this.chainsToCreate.length === 1) {
				let i = this.chainsToCreate[0]
				this.chainsOnBoard[i] = 1
				this.boardChains[inputval[0].charCodeAt(0) - 64][Number(inputval[1])] = this.chains[i][0]
				for (let j = 0; j < adjacents.length; j++) {
					this.boardChains[adjacents[j][0].charCodeAt(0) - 64][Number(adjacents[j][1])] = this.chains[i][0]
				}
				if (this.chainSharesBank[i] > 0) {
					this.playerStocks[this.playerTurn][this.chains[i]] = this.playerStocks[this.playerTurn][this.chains[i]] + 1
					this.chainSharesBank[i] = this.chainSharesBank[i] - 1
				}
			} else if (this.chainsToCreate.length > 1) {
				this.playerPhase = this.selectChainPhase
				this.mergerTile = inputval
				let message = '\nSelect (by first letter) which firm to create your new chain for: '
				for (let i = 0; i < this.chainsToCreate.length; i++) {
					let spacer = ', '
					if (i === 0) {
						spacer = ''
					}
					message += spacer.concat(this.chains[this.chainsToCreate[i]])
				}
				return this.textBack.concat(this.board(), message)
			}
		} else if (adjacentChains.length === 1) { // add to chain
			for (let j = 0; j < adjacents.length; j++) {
				this.boardChains[adjacents[j][0].charCodeAt(0) - 64][Number(adjacents[j][1])] = adjacentChains[0]
			}
		} else if (adjacentChains.length > 1) { // merge chains
			let maxSize = 0
			const sizes = adjacentChains.map((c) => ({ chain: c, size: this.countSize(c) }))
			sizes.sort((a, b) => b.size - a.size)
			const topSize = sizes[0].size
			this.topChains = sizes.filter((s) => s.size === topSize).map((s) => s.chain)
			if (this.topChains.length > 1) {
			   this.playerPhase = this.selectSurvivorPhase
			   this.mergerTile = inputval
			   return this.textBack.concat(this.board(), 'More than one chain has the top size this merger.  Please select surviving chain first letter from among ', 
						this.topChains.map(c => this.chains[this.chainFind(c)]).join(", "))
			}
			this.survivorLetter = this.topChains[0]
			this.defunct = adjacentChains.filter((c) => c !== this.survivorLetter)
			this.mergerTile = inputval
			let report = 'Merger Triggered of '.concat(String(this.chains[this.chainFind(this.defunct[0])]), ' into ', this.chains[this.chainFind(this.survivorLetter)], ' By tile ', this.mergerTile, '\n\n')
			this.playerPhase = this.mergerTradeInPhase
			this.numTradePlayers = 0
			this.currentTradePlayer = this.playerTurn
			this.defunctpos = 0
			report += this.awardBonus(this.defunct[this.defunctpos])

			return this.textBack.concat(this.board(), report, '\n', this.twoForOneOptions())
		}
		return this.startStockBuy(inputval)
	}
	
	closeMerger() {
		// recycle defuncts back to the offboard
		for (let i = 0; i < this.defunct.length; i++) {
			this.chainsOnBoard[this.chainFind(this.defunct[i])] = 0
		}
		// set everything adjacent to the surviving chain
		const adjacents = this.eventualAdjacents(this.mergerTile)
		for (let j = 0; j < adjacents.length; j++) {
			this.boardChains[adjacents[j][0].charCodeAt(0) - 64][Number(adjacents[j][1])] = this.survivorLetter
		}            
		this.playerPhase = this.stockRequestPhase
		return this.textBack.concat(this.startStockBuy(this.mergerTile))		
	}
	
	mergerSellBack(inputval) {
		// handle sales back to the bank.  Call once per player.
		if (Number(inputval) >= 0 && Number(inputval) <= this.maxSellShares) {
			const retval = this.sellDefunct(this.defunct[this.defunctpos], this.currentTradePlayer, Number(inputval))
			if (this.numTradePlayers === this.numPlayers - 1) {
				if (this.defunctpos < this.defunct.length - 1) {
					const oldpos = this.defunctpos
					const newpos = this.defunctpos + 1
					this.defunctpos = newpos
					//console.log(this.defunct, this.defunctpos, this.chainFind(this.defunct[this.defunctpos]))
					this.numTradePlayers = 0
					let report = 'Merger Triggered of '.concat(String(this.chains[this.chainFind(this.defunct[this.defunctpos])]), ' into ', this.chains[this.chainFind(this.survivorLetter)], ' By tile ', this.mergerTile, '\n\n')
					this.playerPhase = this.mergerTradeInPhase
					this.currentTradePlayer = this.playerTurn
					report += this.awardBonus(this.defunct[newpos])                        
					return this.textBack.concat(this.board(), retval, '\n\nMerger of ', String(this.chains[this.chainFind(this.defunct[oldpos])]), ' into ',
										this.chains[this.chainFind(this.survivorLetter)], ' is complete.\n\n', report, '\n', this.twoForOneOptions())
				}
				this.playerPhase = this.closeMergerPhase

				return this.textBack.concat(this.board(), retval, '\n\nMerger of ', String(this.defunct.map(c => this.chains[this.chainFind(c)])), ' into ',
									this.chains[this.chainFind(this.survivorLetter)], ' is complete.\n\nPress Enter to continue.')
			}
			this.numTradePlayers += 1
			this.currentTradePlayer = this.currentTradePlayer + 1
			if (this.currentTradePlayer > this.numPlayers) this.currentTradePlayer = 1
			return this.textBack.concat(this.board(), retval, '\n\n', this.sellBackPrompt())
		}
		return this.textBack.concat(this.board(), `Please enter a number between 0 and ${this.maxSellShares}`)
	}
	
	mergerTradeIn(inputval) {
		if (Number(inputval) >= 0 && Number(inputval) <= this.maxtrade) {
			const tradeval = Number(inputval)
			// convey stock out
			const defunctIndex = this.chainFind(this.defunct[this.defunctpos])
			this.chainSharesBank[defunctIndex] += tradeval * 2
			this.playerStocks[this.currentTradePlayer][this.chains[defunctIndex]] = this.playerStocks[this.currentTradePlayer][this.chains[defunctIndex]] - tradeval * 2
			// convey stock in
			const surviveIndex = this.chainFind(this.survivorLetter)
			this.chainSharesBank[surviveIndex] -= tradeval
			this.playerStocks[this.currentTradePlayer][this.chains[surviveIndex]] += tradeval
			// change to the next player
			this.numTradePlayers += 1
			this.currentTradePlayer = this.currentTradePlayer + 1
			if (this.currentTradePlayer > this.numPlayers) this.currentTradePlayer = 1
			if (this.numTradePlayers === this.numPlayers) {
				this.numTradePlayers = 0
				this.playerPhase = this.mergerSellBackPhase
				this.currentTradePlayer = this.playerTurn
				return this.textBack.concat(this.board(), this.sellBackPrompt())
			}
			return this.textBack.concat(this.board(), this.twoForOneOptions())
		}
		return this.textBack.concat(this.board(), 'Player ', String(this.currentTradePlayer), ', that is not a number between 0 and ', String(this.maxtrade))
	}

	stockRequest(inputval) {
		// now that we have the number of stock to buy, get the firm
		let stockprices = this.calcStocks()		
		if (this.playerPhase !== this.noStockPhase && Number(inputval) > 0 && Number(inputval) <= this.stockLeft) {
			this.playerPhase = this.stockBuyingPhase
			this.stockBuy = Number(inputval)
			this.stockLeft = this.stockLeft - this.stockBuy
			return this.textBack.concat(this.board(), `\n\nHolding Money ${this.playerFunds[this.playerTurn]}\n\n${stockprices}\n\nWhich firm to purchase (first letter is ok) ?`)
		}
		if (inputval === '0' || this.playerPhase === this.noStockPhase) {
			this.nextTurn()
			return this.textBack.concat('Player ', String(this.playerTurn), ' make sure nobody else is looking and hit enter to see your tiles')
		}
		stockprices = this.calcStocks()
		// invalid request of number of stocks, repeat the question
		return this.textBack.concat(this.board(), '\n\n', stockprices, '\n\nHolding Money $', String(this.playerFunds[this.playerTurn]),
			'\n\n', this.playerStockHoldings(true), '\n\nBuy how many shares of a single stock type? (0-', String(this.stockLeft), ')\n\n')
	}
	
	stockBuying(inputval) {
    	let stockprices = this.calcStocks()	
		if (inputval.toUpperCase() === 'X') {
			this.playerPhase = this.noStockPhase
			return this.textBack.concat(this.board(), '\n\nStock Transaction Aborted.  End of turn.')
		}
		const stockBack = this.handleStockChain(inputval)
		// don't advance if we're not right
		if (!stockBack.includes('uccessf')) {
		    this.stockLeft = this.stockLeft + this.stockBuy
			// return this.textBack.concat(this.board(), stockBack, `\n\n${stockprices}\n\nWhich firm to purchase (first letter is ok) (X to abort) ?`)			
		}
		stockprices = this.calcStocks()	
		if (this.stockLeft == 0) {
			this.playerPhase = this.noStockPhase
			return this.textBack.concat(this.board(), stockBack)
		} else {
			this.playerPhase = this.stockRequestPhase
			return this.textBack.concat(this.board(), stockBack, '\n\nHolding Money $', String(this.playerFunds[this.playerTurn]), `\n\n${stockprices}\n\n`, 
				this.playerStockHoldings(true), '\n\nBuy how many shares of a single stock type? (0-', String(this.stockLeft), ')\n\n')
		}		
	}
	
	safeTest() {
		// make sure the justification (with monospace font) works right in all cases
		let stockBlurb = ''
		for (let i = 0; i < this.chains.length; i++) {
			let mysize = 10
			if (Math.random() > 0.7) {
				mysize = 12
			}
			if (mysize > 0) {
				const oneStock = this.stockPriceCalc(mysize, this.chains[i][0])
				this.stockPrices[i] = oneStock
				let spacer = ''
				if (this.chains[i].length < 8) {
					spacer = '   \t'
				}
				if (this.chains[i].length > 7) {
					spacer = spacer.concat('\t')
				}
				if (mysize > 10) {
					spacer = spacer.concat('(safe)')
				} else {
					spacer = spacer.concat('______')
				}
				stockBlurb = stockBlurb.concat(this.chains[i], spacer, '\tcosts $', String(oneStock), ', ', String(this.chainSharesBank[i]), ' left to buy\n')
			}
		}
		return stockBlurb
	}
	
	mergerTestHarness() {
		// engineer beginning of game circumstance that allow a quick test of a 4-way merger
		this.boardTiles.add('E3')
		this.boardTiles.add('D3')
		this.boardTiles.add('G3')
		this.boardTiles.add('H3')
		this.boardTiles.add('F5')
		this.boardTiles.add('F4')
		this.boardTiles.add('F1')
		this.boardTiles.add('F2')
		this.boardChains[5][3] = 'T'
		this.boardChains[4][3] = 'T'
		this.boardChains[7][3] = 'A'
		this.boardChains[8][3] = 'A'
		this.boardChains[6][4] = 'F'
		this.boardChains[6][5] = 'F'
		this.boardChains[6][1] = 'I'
		this.boardChains[6][2] = 'I'
		this.playerStocks[1]['American'] = 5
		//this.playerStocks[2]['American'] = 4
		this.playerStocks[3]['American'] = 4
		this.playerStocks[4]['American'] = 4
		this.playerStocks[5]['American'] = 2
		this.playerStocks[6]['American'] = 2
		this.playerStocks[1]['Festival'] = 3
		this.playerStocks[4]['Festival'] = 5
		this.playerStocks[1]['Tower'] = 2
		this.playerStocks[4]['Tower'] = 1
		this.playerStocks[1]['Imperial'] = 1
		this.playerBags[1].add('F3')
		this.chainsOnBoard[0] = 1
		this.chainsOnBoard[2] = 1
		this.chainsOnBoard[3] = 1
		this.chainsOnBoard[5] = 1
	}

    stepThrough(inputval) {
		// route user inputs to the correct function, depending on the phase of the game
        if (this.numPlayers === 7) {
			return this.getPlayers(inputval)
        }
        if (this.playerPhase === this.hideWarnPhase) {
            this.playerPhase = this.tilesPhase
            return this.textBack.concat('Player ', String(this.playerTurn), ' make sure nobody else is looking and hit enter to see your tiles')
        }
        if (this.playerPhase === this.tilesPhase && this.canEndGame && inputval.toUpperCase() === 'END') {
			return this.gameOver()
        }
        if (this.playerPhase === this.selectChainPhase) {
			return this.selectValidateChain(inputval)
        }
        if (this.playerPhase === this.selectSurvivorPhase) {
			return this.selectValidateSurvivor(inputval)
        }
        if (this.playerPhase === this.tilesPhase && this.playerBags[this.playerTurn].has(inputval)) {
			return this.playTile(inputval)
        }
        if (this.playerPhase === this.closeMergerPhase) {
			return this.closeMerger()
        }
        if (this.playerPhase === this.mergerSellBackPhase) {
			return this.mergerSellBack(inputval)
        }
        if (this.playerPhase === this.mergerTradeInPhase) {
			return this.mergerTradeIn(inputval)
        }
        if (this.playerPhase === this.stockRequestPhase || this.playerPhase === this.noStockPhase) {
			return this.stockRequest(inputval)
        }
        if (this.playerPhase === this.stockBuyingPhase) {
			return this.stockBuying(inputval)
        }
        if (false && inputval.toUpperCase() === 'SAFE') {
			return this.safeTest()
        }
        // test harness for mergers
        if (inputval.toUpperCase() === 'MTH') {
			this.mergerTestHarness()
        }

		// this is the default behavior -- allow the user to play a tile on the board
        // remove any unplayable tiles and replace them with new tiles
        let playerHeld = Array.from(this.playerBags[this.playerTurn])
        let removedMessage = ''
        let drawnTile = ''
		this.canEndGame = false
        for (let i = 0; i < playerHeld.length; i++) {
            if (!this.safeChainChecker(playerHeld[i])) {
                removedMessage = removedMessage.concat('Removed tile ', playerHeld[i], ' for causing mergers between safe chains\n\n')
                this.playerBags[this.playerTurn].delete(playerHeld[i])
                // draw a replacement
                let drewpassed = false
                while (!drewpassed) {
                    drawnTile = this.drawTile()
                    // allow us to draw out the tile bag if necessary
                    if (drawnTile === '') {
                        drewpassed = true
                    } else {
                        drewpassed = this.safeChainChecker(drawnTile)
                    }
                    if (!drewpassed) {
                        removedMessage = removedMessage.concat('Removed drawn replacement tile ', drawnTile, ' for causing mergers between safe chains\n\n')
                    }
                }
                if (drawnTile !== '') {
                    this.playerBags[this.playerTurn].add(drawnTile)
                }
            }
        }
        // check for game ending conditions; game ending happens when a player wishes it (or is out of tiles)
        let gameEndMessage = ''
        if (this.tileBag.size === 0) {
            this.canEndGame = true
            gameEndMessage = gameEndMessage.concat('\n\nThe Tile Bag is Empty.  You may end the game if you like by typing "end".')
        }
        let anyNonSafe = false
        let anyChainOnBoard = false
        for (let i = 0; i < this.chains.length; i++) {
            const thisSize = this.countSize(this.chains[i])
            if (thisSize > 40) {
                this.canEndGame = true
                gameEndMessage = gameEndMessage.concat('\n\nThere is a firm larger than 40.  You may end the game if you like by typing "end".')
            }
            if (thisSize > 1) {
                anyChainOnBoard = true
            }
            if (thisSize < 11 && thisSize > 1) {
                anyNonSafe = true
            }
        }
        if (!anyNonSafe && anyChainOnBoard) {
            this.canEndGame = true
            gameEndMessage = gameEndMessage.concat('\n\nAll chains are safe.  You may end the game if you like by typing "end".')
        }
        return this.textBack.concat(this.board()).concat('Player ',String(this.playerTurn),`, you are holding\n\nMoney $${String(this.playerFunds[this.playerTurn])}\n\n${this.playerStockHoldings(false)}${removedMessage}`,
                                     "Choose a tile to play:\n\n",this.showPlayerTiles(), gameEndMessage)
    }

} // end of acquire function

// tile in code for the HTML
const output = document.getElementById('output')
const input = document.getElementById('input')
const submit = document.getElementById('submit')

const game = new AcquireGame()
output.textContent = game.textBack

function runInput() {
  const value = input.value
  const response = game.stepThrough(value)
  output.textContent = response
  input.value = ''
  input.focus()
}

submit.addEventListener('click', runInput)
input.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    runInput()
  }
})

input.focus()
