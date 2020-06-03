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

// Setup static file server
app.use(express.static('public'));

var started = false;

const suits = ["s", "h", "d", "c"];
const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

const deck = [];
const players = [];

function createDeck() {
	for (let i = 0; i < values.length; i++) {
		for (let x = 0; x < suits.length; x++) {
			let weight = parseInt(values[i]);
			if (values[i] == "J")
				weight = 10;
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
	const result = {card: card, offset: players[playerNum].Placed.length * 0.05, back: false, clear: true}
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
	let winner = card0.Weight - card1.Weight;
	if (winner > 0) {
		winner = 0;
	} else if (winner < 0) {
		winner = 1;
	} else {
		winner = -1;
	}
	if (winner == -1) {
		// War!
		console.log('War!');
	} else {
		players[winner].Hand.push.apply(players[winner].Hand, players[0].Placed.concat(players[1].Placed));
		for (let i = 0; i < players.length; ++i) {
			players[i].Placed.length = 0;
		}
	}
	return result;
}

io.on('connection', (socket) => {
	const playerNum = connections.length;
	connections.push(socket);
	console.log('A user connected to socket.io');
	socket.on('card', (data) => {
		if (!started) {
			return;
		}
		const card = placeCard(playerNum);
		if (card != null) {
			socket.emit('card', card);
			for (let i = 0; i < connections.length; ++i) {
				if (connections[i].id == socket.id) {
					continue;
				}
				connections[i].emit('opponent', card);
			}
		}
		console.log('Player 0:', players[0].Hand.length);
		console.log('Player 1:', players[1].Hand.length);
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
	if (connections.length == 2 && !started) {
		started = true;
		startGame();
	}
});

