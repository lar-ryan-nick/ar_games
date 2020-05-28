const fs = require('fs');
const express = require('express');
const app = express();
const options = {
	key: fs.readFileSync('encryption/private.key'),
	cert: fs.readFileSync('encryption/domain.crt'),
}
const https = require('https').createServer(options, app).listen(443);
const io = require('socket.io')(https);

app.use(express.static('public'));

io.on('connection', (socket) => {
	console.log('A user connected to socket.io');
	socket.on('disconnect', () => {
		console.log('A user disconnected');
	});
});
