const suits = ["s", "h", "d", "c"];
const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
var currentPlayer = 0;

AFRAME.registerComponent('main', {
    init: function() {
        this.playerTarget = document.getElementById('player_card')
        this.computerTarget = document.getElementById('computer_card')
        this.playerText = document.getElementById('player-text')
        this.deck = new Array();
        this.players = new Array();
        this.warStatus = false;
        this.warPot = new Array()

        this.endGameText = document.createElement('a-text')
        this.endGameText.setAttribute("rotation", "0 0 180")
        this.endGameText.setAttribute("width", "5")
        this.endGameText.setAttribute("height", "5")
        this.endGameText.setAttribute("position", "0 0 0" )
        this.endGameText.setAttribute("color", "black")
        this.endGameText.setAttribute("align", "center")

        this.createDeck = this.createDeck.bind(this)
				this.createPlayers = this.createPlayers.bind(this)
				this.shuffle = this.shuffle.bind(this)
				this.startGame = this.startGame.bind(this)
				this.flipCards = this.flipCards.bind(this)
				this.startWar = this.startWar.bind(this)
				this.checkForWinner = this.checkForWinner.bind(this)
				this.clearCards = this.clearCards.bind(this)
				this.placeCard = this.placeCard.bind(this)
                this.addCardCounter = this.addCardCounter.bind(this)

				const playerTappable = document.getElementById('player-tappable')
				playerTappable.addEventListener('click', function(event) {
				    this.playerText.setAttribute("visible", "false")

                    if(!this.warStatus) {
                        this.flipCards();
                    } else {
                        this.startWar();
                    }
				}.bind(this))

        this.startGame()
    },

    createDeck: function() {
        for (var i = 0; i < values.length; i++) {
            for (var x = 0; x < suits.length; x++) {
                var weight = parseInt(values[i]);
                if (values[i] == "J")
                    weight = 11;
                if (values[i] == "Q")
                    weight = 12;
                if (values[i] == "K")
                    weight = 13;
                if (values[i] == "A")
                    weight = 14;
                const card = {Value: values[i], Suit: suits[x], Weight: weight};
                this.deck.push(card);
            }
        }
    },

    createPlayers: function(num) {
        for (var i = 1; i <= num; i++) {
            var hand = new Array();
            var player = {Name: 'Player ' + i, ID: i, Hand: hand};
            this.players.push(player);
        }
    },



    shuffle: function() {
        // for 1000 turns
        // switch the values of two random cards
        for (var i = 0; i < 1000; i++) {
            const location1 = Math.floor((Math.random() * this.deck.length));
            const location2 = Math.floor((Math.random() * this.deck.length));
            const tmp = this.deck[location1];

            this.deck[location1] = this.deck[location2];
            this.deck[location2] = tmp;
        }
    },

    startGame: function() {
				console.log("Started the game!")
        // deal 2 cards to every player object
        currentPlayer = 0;
        this.createDeck();
        this.shuffle();
        this.createPlayers(2);
        this.dealHands();
        //this.flipCards();
        console.log(this.players[0].Hand)
    },

    dealHands: function() {
        // alternate handing cards to each player
        // 2 cards each
				// TODO: make work for more than 2 players?
        for (var i = 0; i < 26; i++) {
            for (var x = 0; x < this.players.length; x++) {
                const card = this.deck.pop();
                this.players[x].Hand.push(card);
                //renderCard(card, x);
            }
        }
    },

    flipCards: function() {
				this.clearCards(this.playerTarget)
				this.clearCards(this.computerTarget)
        // this.addCardCounter()

        playersCard = this.players[0].Hand.shift();
        computersCard = this.players[1].Hand.shift();

        this.runAnimation(playersCard, computersCard)

        console.log(playersCard)

				this.placeCard(true, playersCard, 0, false, false);
				this.placeCard(false, computersCard, 0, false, false);

        if (playersCard.Weight == computersCard.Weight) {
            // If cards are the same rank begin a war and add the two cards to the pot
            this.warStatus = true
            this.warPot.push(computersCard)
            this.warPot.push(playersCard)
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

		placeCard: function(playerTarget, card, offset, back, pot) {
            const image = document.createElement('a-image')
            image.object3D.scale.set(0.75, 0.75, 0.75);
            var xOffset = 0;
            var yOffset = 0;
            var zOffset = offset;

            if(pot) {
                xOffset = .75
                yOffset = -.4
            }
            if(!playerTarget) {
                yOffset = -.8
            } else {
                yOffset = yOffset + offset
            }

            image.object3D.position.set(xOffset, yOffset, zOffset)

            if (!back) {
                image.setAttribute('src', "#" + card.Suit + "_" + card.Value.toLowerCase())
            } else {
                image.setAttribute('src', "#back")
            }
            this.playerTarget.appendChild(image)
		},

		clearCards: function(target) {
			target.querySelectorAll('a-image').forEach(element => {
				console.log(element)
				target.removeChild(element)
			})
		},

    startWar: function() {
        this.clearCards(this.playerTarget)
        this.clearCards(this.computerTarget)
        this.addCardCounter()
        //console.log("hand length before: " + this.players[0].Hand.length)

        // Check if both players have enough cards for the war
        if (this.players[0].Hand.length < 3) {
            // Computer wins
						this.playerText.setAttribute('value', 'Not enough cards for war. You lose.')
        }
        if (this.players[1].Hand.length < 3) {
            // Player wins
						this.playerText.setAttribute('value', 'Opponent ran out of cards for war. You won!')
        }
                //this.placeCard(true, this.warPot.top, 0, true, true)

                for (var i = 0; i < 2; ++i) {
                    var playersCard = this.players[0].Hand.shift();
                    var computersCard = this.players[1].Hand.shift();
                    this.warPot.push(playersCard)
                    this.warPot.push(computersCard)
                }

				for (var i = 0; i < this.warPot.length; ++i) {
					this.placeCard(true, null, i / 2 * 0.1, true, true);
				}

                var playersCard = this.players[0].Hand.shift();
                var computersCard = this.players[1].Hand.shift();
				this.placeCard(true, playersCard, 0, false, false);
                this.placeCard(false, computersCard, 0, false, false);

				console.log('WAR!')
				console.log(this.warPot)

        if (playersCard.Weight == computersCard.Weight) {
            // If cards are the same rank continue the war and add the two cards to the pot
        } else if (playersCard.Weight > computersCard.Weight) {
            // If the player has a higher rank card, add the pot to the bottom of their hand
            this.players[0].Hand.push.apply(this.players[0].Hand, this.warPot)
            this.checkForWinner()
            this.warStatus = false;
            this.warPot = new Array();
            //console.log("hand length after: " + this.players[0].Hand.length)
        } else {
            // If the computer has a higher rank card, add the pot to the bottom of their hand
            this.players[1].Hand.push.apply(this.players[1].Hand, this.warPot)
            this.checkForWinner()
            this.warStatus = false;
            this.warPot = new Array();
            //console.log("hand length after: " + this.players[0].Hand.length)
        }
    },

    checkForWinner: function() {
        if (this.players[0].Hand.length == 52) {
            this.clearCards(this.playerTarget)
            this.clearCards(this.computerTarget)
            //TODO: display player win
            this.endGameText.setAttribute("value", "YOU WIN!!!")
            this.playerTarget.appendChild(this.endGameText)
        }
        if (this.players[1].Hand.length == 52) {
            this.clearCards(this.playerTarget)
            this.clearCards(this.computerTarget)
            //TODO: display computer win
            this.endGameText.setAttribute("value", "You Lost.")
            this.playerTarget.appendChild(this.endGameText)
        }
    },

    addCardCounter: function () {
        this.cardCounter = document.createElement('a-image')
        this.cardCounter.setAttribute("src", "#back")
        this.cardCounter.setAttribute("scale", ".25 .25")
        this.cardCounter.setAttribute("position", "-.5 .6 0")

        this.ccText = document.createElement("a-text")
        this.ccText.setAttribute("rotation", "0 0 180")
        this.ccText.setAttribute("width", "10")
        this.ccText.setAttribute("height", "10")
        this.ccText.setAttribute("position", "0 0 0" )
        this.ccText.setAttribute("color", "black")
        this.ccText.setAttribute("align", "center")
        this.ccText.setAttribute("value", "-1")

        this.cardCounter.appendChild(this.ccText)
        this.ccText.setAttribute('value', this.players[0].Hand.length.toString())
        this.playerTarget.appendChild(this.cardCounter)
    },

    runAnimation: function(playerCard, computerCard) {
        this.playerShip = document.createElement('a-obj-model')
        this.playerShip.setAttribute("src", "./models/tie_fighter.obj")
        this.playerShip.setAttribute("mtl", "./models/tie_fighter.mtl")
        this.playerShip.setAttribute("scale", ".15 .15 .15")
        this.playerShip.setAttribute("position", ".05 .1 .2")
        this.playerShip.setAttribute("rotation", "90 0 0")
        this.playerShip.setAttribute("animation__2", "property: visible; from: true; to: false; delay: 7000")

        this.computerShip = document.createElement('a-obj-model')
        this.computerShip.setAttribute("src", "./models/tie_fighter.obj")
        this.computerShip.setAttribute("mtl", "./models/tie_fighter.mtl")
        this.computerShip.setAttribute("scale", ".15 .15 .15")
        this.computerShip.setAttribute("position", ".05 -1 .2")
        this.computerShip.setAttribute("rotation", "-90 0 0")
        this.computerShip.setAttribute("animation__2", "property: visible; from: true; to: false; delay: 7000")

        this.RightBeam = document.createElement('a-cylinder')
        this.RightBeam.setAttribute("height", ".2")
        this.RightBeam.setAttribute("radius", ".01")
        this.RightBeam.setAttribute("visible", "false")
        this.RightBeam.setAttribute("animation__2", "property: visible; from: false; to: true; delay: 2000")
        this.RightBeam.setAttribute("animation__3", "property: visible; from: true; to: false; delay: 4000")

        this.LeftBeam = document.createElement('a-cylinder')
        this.LeftBeam.setAttribute("height", ".2")
        this.LeftBeam.setAttribute("radius", ".01")
        this.LeftBeam.setAttribute("visible", "false")
        this.LeftBeam.setAttribute("animation__2", "property: visible; from: false; to: true; delay: 2000")
        this.LeftBeam.setAttribute("animation__3", "property: visible; from: true; to: false; delay: 4000")

        if(playerCard.Weight > computerCard.Weight) {
            this.computerShip.setAttribute("animation__3", "property: visible; from: true; to: false; delay: 4000")

            this.RightBeam.setAttribute("position", ".1 .1 .1" )
            this.RightBeam.setAttribute("material", "opacity: .8; color: green")
            this.RightBeam.setAttribute("animation", "property: position; to: .1 -1 .1; dur: 200; " +
                "easing: linear; loop: 15")

            this.LeftBeam.setAttribute("position", "-.1 .1 .1" )
            this.LeftBeam.setAttribute("material", "opacity: .8; color: green")
            this.LeftBeam.setAttribute("animation", "property: position; to: -.1 -1 .1; dur: 200; " +
                "easing: linear; loop: 15")
        } else if(computerCard.Weight > playerCard.Weight) {
            this.playerShip.setAttribute("animation__3", "property: visible; from: true; to: false; delay: 4000")

            this.RightBeam.setAttribute("position", ".1 -1 .1" )
            this.RightBeam.setAttribute("material", "opacity: .8; color: red")
            this.RightBeam.setAttribute("animation", "property: position; to: .1 .1 .1; dur: 200; " +
                "easing: linear; loop: 15")

            this.LeftBeam.setAttribute("position", "-.1 -1 .1" )
            this.LeftBeam.setAttribute("material", "opacity: .8; color: red")
            this.LeftBeam.setAttribute("animation", "property: position; to: -.1 .1 .1; dur: 200; " +
                "easing: linear; loop: 15")
        }

        this.playerTarget.appendChild(this.playerShip)
        this.playerTarget.appendChild(this.RightBeam)
        this.playerTarget.appendChild(this.LeftBeam)
        this.playerTarget.appendChild(this.computerShip)
    }
});
