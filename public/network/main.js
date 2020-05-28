var currentPlayer = 0;

AFRAME.registerComponent('main', {
	init: function() {
				this.socket = io.connect('https://fog.mat.ucsb.edu')
				this.socket.on('start', (data) => {
				})
				this.socket.on('opponent', (data) => {
				})
		this.playerTarget = document.getElementById('player_card')
		this.computerTarget = document.getElementById('computer_card')
		this.playerText = document.getElementById('player-text')

				this.createDeck = this.createDeck.bind(this)
				this.createPlayers = this.createPlayers.bind(this)
				this.shuffle = this.shuffle.bind(this)
				this.startGame = this.startGame.bind(this)
				this.flipCards = this.flipCards.bind(this)
				this.startWar = this.startWar.bind(this)
				this.checkForWinner = this.checkForWinner.bind(this)
				this.clearCards = this.clearCards.bind(this)
				this.placeCard = this.placeCard.bind(this)

				const playerTappable = document.getElementById('player-tappable')
				playerTappable.addEventListener('click', function(event) {
					this.flipCards();
				}.bind(this))
		this.startGame()
	},

	flipCards: function() {
				this.clearCards(this.playerTarget)
				this.clearCards(this.computerTarget)

		playersCard = this.players[0].Hand.shift();
		computersCard = this.players[1].Hand.shift();

		console.log(playersCard)

				this.placeCard(this.playerTarget, playersCard, 0, false);
				this.placeCard(this.computerTarget, computersCard, 0, false);

		if (playersCard.Weight == computersCard.Weight) {
			// If cards are the same rank begin a war and add the two cards to the pot
			var warPot = new Array()
			warPot.push(playersCard)
			warPot.push(computersCard)
			this.startWar(warPot)
		} else if (playersCard.Weight > computersCard.Weight) {
			// If the player has a higher rank card, add both cards to the bottom of their hand
			this.players[0].Hand.push(playersCard)
			this.players[0].Hand.push(computersCard)
			this.checkForWinner()
		} else {
			// If the computer has a higher rank card, add both cards to the bottom of their hand
			this.players[1].Hand.push(playersCard)
			this.players[1].Hand.push(computersCard)
			this.checkForWinner()
		}
				console.log(this.players[0].Hand)
				console.log(this.players[1].Hand)
	},

	placeCard: function(target, card, offset, back) {
		const image = document.createElement('a-image')
		image.object3D.scale.set(0.75, 0.75, 0.75)
		image.object3D.position.set(0, offset, offset)
		if (!back) {
			image.setAttribute('src', "#" + card.Suit + "_" + card.Value.toLowerCase())
		} else {
			image.setAttribute('src', "#back")
		}
		target.appendChild(image)
	},

	clearCards: function(target) {
		target.querySelectorAll('a-image').forEach(element => {
			console.log(element)
			target.removeChild(element)
		})
	},

	startWar: function(warPot) {
		// Check if both players have enough cards for the war
		if (this.players[0].Hand.length < 3) {
			// Computer wins
						this.playerText.setAttribute('value', 'Not enough cards for war. You lose.')
		}
		if (this.players[1].Hand.length < 3) {
			// Player wins
						this.playerText.setAttribute('value', 'Opponent ran out of cards for war. You won!')
		}

				for (var i = 0; i < 3; ++i) {
					var playersCard = this.players[0].Hand.shift();
					var computersCard = this.players[1].Hand.shift();
					warPot.push(playersCard)
					warPot.push(computersCard)
					this.placeCard(this.playerTarget, playersCard, warPot.length / 2 * 0.1, i != 2);
					this.placeCard(this.computerTarget, computersCard, warPot.length / 2 * 0.1, i != 2);
				}

				console.log('WAR!')
				console.log(warPot)

		if (playersCard.Weight == computersCard.Weight) {
			// If cards are the same rank continue the war and add the two cards to the pot
			this.startWar(warPot)
		} else if (playersCard.Weight > computersCard.Weight) {
			// If the player has a higher rank card, add the pot to the bottom of their hand
			this.players[0].Hand.push.apply(this.players[0].Hand, warPot)
			this.checkForWinner()
		} else {
			// If the computer has a higher rank card, add the pot to the bottom of their hand
			this.players[1].Hand.push.apply(this.players[1].Hand, warPot)
			this.checkForWinner()
		}
	},

	checkForWinner: function() {
		if (this.players[0].Hand.length == 52) {
			//TODO: display player win
						this.playerText.setAttribute('value', 'You won!')
		}
		if (this.players[1].Hand.length == 52) {
			//TODO: display computer win
						this.playerText.setAttribute('value', 'You lost.')
		}
	}
});
