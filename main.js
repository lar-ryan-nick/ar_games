var suits = ["Spades", "Hearts", "Diamonds", "Clubs"];
var values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
var deck = new Array();
var players = new Array();
var currentPlayer = 0;

function createDeck()
{
    deck = new Array();
    for (var i = 0 ; i < values.length; i++)
    {
        for(var x = 0; x < suits.length; x++)
        {
            var weight = parseInt(values[i]);
            if (values[i] == "J")
                weight = 10;
            if(values[i] == "Q")
                weight = 12;
            if(values[i] == "K")
                weight = 13;
            if (values[i] == "A")
                weight = 14;
            var card = { Value: values[i], Suit: suits[x], Weight: weight };
            deck.push(card);
        }
    }

    function createPlayers(num)
    {
        players = new Array();
        for(var i = 1; i <= num; i++)
        {
            var hand = new Array();
            var player = { Name: 'Player ' + i, ID: i, Hand: hand };
            players.push(player);
        }
    }

    function shuffle()
    {
        // for 1000 turns
        // switch the values of two random cards
        for (var i = 0; i < 1000; i++)
        {
            var location1 = Math.floor((Math.random() * deck.length));
            var location2 = Math.floor((Math.random() * deck.length));
            var tmp = deck[location1];

            deck[location1] = deck[location2];
            deck[location2] = tmp;
        }
    }

    function startgame()
    {
        // deal 2 cards to every player object
        currentPlayer = 0;
        createDeck();
        shuffle();
        createPlayers(2);
        dealHands();
    }

    function dealHands()
    {
        // alternate handing cards to each player
        // 2 cards each
        for(var i = 0; i < 26; i++)
        {
            for (var x = 0; x < players.length; x++)
            {
                var card = deck.pop();
                players[x].Hand.push(card);
                //renderCard(card, x);
            }
        }
    }

    function flipCards()
    {
        playersCard = players[0].Hand.pop();
        computersCard = players[1].Hand.pop();

        if(playersCard.weight == computersCard.weight) {
            // If cards are the same rank begin a war and add the two cards to the pot
            var warPot = new Array()
            warPot.push(playersCard)
            warPot.push(computersCard)
            startWar(warPot)
        } else if (playersCard.weight > computersCard.weight) {
            // If the player has a higher rank card, add both cards to the bottom of their hand
            players[0].Hand.push(playersCard)
            players[0].Hand.push(computersCard)
            checkForWinner()
        } else {
            // If the computer has a higher rank card, add both cards to the bottom of their hand
            players[1].Hand.push(playersCard)
            players[1].Hand.push(computersCard)
            checkForWinner()
        }
    }

    function startWar(warPot) {
        // Check if both players have enough cards for the war
        if(players[0].Hand.length < 2) {
            // Computer wins
        }
        if(players[1].Hand.length < 2) {
            // Player wins
        }

        playersCard = players[0].Hand.pop();
        computersCard = players[1].Hand.pop();

        // Add the face down cards to the pot
        warPot.push(players[1].Hand.pop())
        warPot.push(players[0].Hand.pop())

        if(playersCard.weight == computersCard.weight) {
            // If cards are the same rank continue the war and add the two cards to the pot
            warPot.push(playersCard)
            warPot.push(computersCard)
            startWar(warPot)
        } else if (playersCard.weight > computersCard.weight) {
            // If the player has a higher rank card, add the pot to the bottom of their hand
            players[0].Hand.concat(warPot)
            checkForWinner()
        } else {
            // If the computer has a higher rank card, add the pot to the bottom of their hand
            players[1].Hand.concat(warPot)
            checkForWinner()
        }
    }

    function checkForWinner() {
        if(players[0].Hand.length == 52) {
            //TODO: display player win
        }
        if(players[1].Hand.length == 52) {
            //TODO: display computer win
        }
    }

    window.addEventListener('load', function(){
        createDeck();
        shuffle();
        createPlayers(1);
    });


}