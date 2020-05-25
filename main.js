const suits = ["s", "h", "d", "c"];
const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
var currentPlayer = 0;

AFRAME.registerComponent('main', {
    init: function() {
				console.log("INIT 1")
        this.playerTarget = document.getElementById('player_card')
        this.computerTarget = document.getElementById('computer_card')
        this.playerText = document.getElementById('player-text')
        this.deck = new Array();
        this.players = new Array();

				this.createDeck = this.createDeck.bind(this)
				this.createPlayers = this.createPlayers.bind(this)
				this.shuffle = this.shuffle.bind(this)
				this.startGame = this.startGame.bind(this)
				this.flipCards = this.flipCards.bind(this)
				this.startWar = this.startWar.bind(this)
				this.checkForWinner = this.checkForWinner.bind(this)
				// TODO
				//this.playCard = this.playCard.bind(this)

				const playerTappable = document.getElementById('player-tappable')
				playerTappable.addEventListener('click', function(event) {
					this.flipCards();
				}.bind(this))
        this.startGame()
    },

    createDeck: function() {
        for (var i = 0; i < values.length; i++) {
            for (var x = 0; x < suits.length; x++) {
                var weight = parseInt(values[i]);
                if (values[i] == "J")
                    weight = 10;
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
            var location1 = Math.floor((Math.random() * this.deck.length));
            var location2 = Math.floor((Math.random() * this.deck.length));
            var tmp = this.deck[location1];

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
                var card = this.deck.pop();
                this.players[x].Hand.push(card);
                //renderCard(card, x);
            }
        }
    },

    flipCards: function() {
        playersCard = this.players[0].Hand.shift();
        computersCard = this.players[1].Hand.shift();

        console.log(playersCard)

        const playerCurCard = document.createElement('a-image')
        const computerCurCard = document.createElement('a-image')

        console.log("#" + playersCard.Suit + "_" + playersCard.Value)
        playerCurCard.object3D.scale.set(0.75, 0.75, 0.75)
        computerCurCard.object3D.scale.set(0.75, 0.75, 0.75)
        //playerCurCard.setAttribute("rotation", "90 90 90")
        //computerCurCard.setAttribute("rotation", "90 90 90")
        playerCurCard.setAttribute('src', "#" + playersCard.Suit + "_" + playersCard.Value.toLowerCase())
        computerCurCard.setAttribute('src',"#" + computersCard.Suit + "_" + computersCard.Value.toLowerCase())
        this.playerTarget.appendChild(playerCurCard)
        this.computerTarget.appendChild(computerCurCard)

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

    startWar: function(warPot) {
        // Check if both players have enough cards for the war
        if (this.players[0].Hand.length < 2) {
            // Computer wins
						this.playerText.setAttribute('text', 'You lost.')
        }
        if (this.players[1].Hand.length < 2) {
            // Player wins
						this.playerText.setAttribute('text', 'You won!')
        }

				// Add the face down cards to the pot
				warPot.push(this.players[0].Hand.shift())
				warPot.push(this.players[1].Hand.shift())
				warPot.push(this.players[0].Hand.shift())
				warPot.push(this.players[1].Hand.shift())

        const playersCard = this.players[0].Hand.shift();
        const computersCard = this.players[1].Hand.shift();
				warPot.push(playersCard)
				warPot.push(computersCard)

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
						this.playerText.setAttribute('text', 'You won!')
        }
        if (this.players[1].Hand.length == 52) {
            //TODO: display computer win
						this.playerText.setAttribute('text', 'You lost.')
        }
    }
});
