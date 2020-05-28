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
		const hand = new Array();
		const player = {Name: 'Player ' + i, ID: i, Hand: hand};
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

io.on('connection', (socket) => {
	connections.push(socket);
	console.log('A user connected to socket.io');
	startGame();
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
});
