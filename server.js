const fs = require('fs');
const app = require('express')();
const options = {
	key: fs.readFileSync('encryption/private.key'),
	cert: fs.readFileSync('encryption/domain.crt'),
}
const https = require('https').createServer(options, app).listen(443);
const io = require('socket.io')(https);

app.get('/', (req, res) => {
	console.log('Received a connection for index.html');
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
	console.log('A user connected to socket.io');
	socket.on('disconnect', () => {
		console.log('A user disconnected');
	});
});
