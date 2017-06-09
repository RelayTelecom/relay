var app = require('express')();
app.use(require('cors'));

var http = require('http').Server(app);
var io = require('socket.io')(http);
var ioClient = require('socket.io-client');
var path = require('path');
var publicIp = require('public-ip');

var ss = require('socket.io-stream');

let showPort = 8642;
const port = process.env.PORT || showPort;


if (process.env.PORT) {
	showPort = 80;
}

const whisperSocket = ioClient("https://relay-telecom.herokuapp.com");
publicIp.v4().then((ip) => {
	setInterval(() => {
		whisperSocket.emit('relaytelecom-advertise', ip + ':' + showPort);
	}, 3000);
});

app.get('/', function(req, res){
	res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

io.on('connection', function(socket){
	var roomNumber = 0;

	var clients = Object.keys(io.sockets.sockets).length;
	io.sockets.emit('broadcast', clients + ' client(s) connected total');

	socket.on('joinRoom', function(roomNo) {
		roomNumber = roomNo;
		socket.join(roomNumber);
		console.log('client joined room ' + roomNumber);

		clientsInRoom = io.sockets.adapter.rooms[roomNumber].length;
		socket.broadcast.to(roomNumber).emit('connectToRoom', clientsInRoom + ' client(s) in room now');
	});

	socket.on('audioBuffer', function(audioChunk){
		socket.broadcast.to(roomNumber).emit('communicate', audioChunk);
	});

	socket.on('disconnect', function () {
		io.sockets.emit('broadcast', clients + ' client(s) connected total');
    });
});

http.listen(port, function(){
  console.log('listening on localhost:' + port);
});
