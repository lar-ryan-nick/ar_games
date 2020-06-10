const fs = require('fs');
const express = require('express');
const app = express();
const options = {
	key: fs.readFileSync('encryption/private.key'),
	cert: fs.readFileSync('encryption/domain.crt')
}
const https = require('https').createServer(options, app).listen(443);
const io = require('socket.io')(https);
const connections = [];
/* Use to log every request
app.use((req, res, next) => {
	console.log('Request for:', req.url);
	next();
});
*/
// Setup static file server
app.use(express.static('public'));

const suits = ["s", "h", "d", "c"];
const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

const deck = [];
const players = [];

function createDeck() {
	deck.length = 0;
	for (let i = 0; i < values.length; i++) {
		for (let x = 0; x < suits.length; x++) {
			let weight = parseInt(values[i]);
			if (values[i] == "J")
				weight = 11;
			if (values[i] == "Q")
				weight = 12;
			if (values[i] == "K")
				weight = 13;
			if (values[i] == "A")
				weight = 14;
			const card = {Value: values[i], Suit: suits[x], Weight: weight};
			deck.push(card);
		}
	}
}

function createPlayers(num) {
	players.length = 0;
	for (let i = 1; i <= num; i++) {
		const player = {Name: 'Player ' + i, ID: i, Hand: [], Placed: []};
		players.push(player);
	}
}

function shuffle() {
	// for 1000 turns
	// switch the values of two random cards
	for (let i = 0; i < 1000; i++) {
		const location1 = Math.floor((Math.random() * deck.length));
		const location2 = Math.floor((Math.random() * deck.length));
		const tmp = deck[location1];
		deck[location1] = deck[location2];
		deck[location2] = tmp;
	}
}

function dealHands() {
	// TODO: make work for more than 2 players?
	for (let i = 0; i < 26; i++) {
		for (let x = 0; x < players.length; x++) {
			const card = deck.pop();
			players[x].Hand.push(card);
		}
	}
}

function startGame() {
	console.log("Started the game!");
	// deal 2 cards to every player object
	createDeck();
	createPlayers(2);
	shuffle();
	dealHands();
}

function canPlace(playerNum) {
	if (players.length <= playerNum) {
		return false;
	}
	// TODO: check hand
	if (players[playerNum].Placed.length % 3 != 1) {
		return true;
	}
	for (let i = 0; i < players.length; ++i) {
		if (i == playerNum) {
			continue;
		}
		if (players[playerNum].Placed.length <= players[i].Placed.length) {
			return true;
		}
	}
	return false;
}

function placeCard(playerNum) {
	if (!canPlace(playerNum)) {
		return null;
	}
	const card = players[playerNum].Hand.shift();
	const result = {card: card, offset: players[playerNum].Placed.length * 0.05, back: false, clear: true, winner: -1};
	for (let i  = 0; i < players.length; ++i) {
		if (players[i].Placed.length > 0) {
			result.clear = false;
			break;
		}
	}
	players[playerNum].Placed.push(card);
	if (players[playerNum].Placed.length % 3 != 1) {
		result.back = true;
		return result;
	}
	for (let i = 0; i < players.length; ++i) {
		if (i == playerNum) {
			continue;
		}
		if (players[i].Placed.length != players[playerNum].Placed.length) {
			return result;
		}
	}
	// TODO: remove hardcode for two people
	const card0 = players[0].Placed.pop();
	const card1 = players[1].Placed.pop();
	players[0].Placed.push(card0);
	players[1].Placed.push(card1);
	result.winner = card0.Weight - card1.Weight;
	if (result.winner > 0) {
		result.winner = 0;
	} else if (result.winner < 0) {
		result.winner = 1;
	} else {
		result.winner = -1;
	}
	if (result.winner == -1) {
		// War!
		console.log('War!');
	} else {
		for (let i = 0; i < players.length; ++i) {
			players[result.winner].Hand.push.apply(players[result.winner].Hand, players[i].Placed);
			players[i].Placed.length = 0;
		}
	}
	return result;
}

function getWinner() {
	for (let i = 0; i < players.length; ++i) {
		if (players[i].Hand.length == 52) {
			return i;
		}
	}
	return -1;
}

io.on('connection', (socket) => {
	const playerNum = connections.length;
	connections.push(socket);
	console.log('A user connected to socket.io');
	socket.on('card', (data) => {
		const cardData = placeCard(playerNum);
		if (cardData != null) {
			const winner = cardData.winner;
			for (let i = 0; i < connections.length; ++i) {
				cardData.handCount = players[i].Hand.length;
				cardData.winner = winner == -1 ? -1 : winner == i;
				cardData.player = i == playerNum
				connections[i].emit('card', cardData);
			}
		}
		const winner = getWinner();
		if (winner != -1) {
			for (let i = 0; i < connections.length; ++i) {
				connections[i].emit('end', {won: winner == playerNum});
			}
		}
	});
	socket.on('disconnect', () => {
		console.log('A user disconnected');
		for (let i = 0; i < connections.length; ++i) {
			if (connections[i].id == socket.id) {
				connections.splice(i, 1);
				break;
			}
		}
		console.log(connections);
	});
	// TODO: Remove hardcode on 2 player game
	if (connections.length == 2) {
		startGame();
		for (let i = 0; i < connections.length; ++i) {
			connections[i].emit('start', {});
		}
	}
});

