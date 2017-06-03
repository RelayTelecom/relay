var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

var ss = require('socket.io-stream');

const port = 8642;

app.get('/', function(req, res){
	res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

var clients = 0;

io.on('connection', function(socket){
	clients++;
	var roomNumber = 0;
	
	io.sockets.emit('broadcast', clients + ' client(s) connected total');
	
	socket.on('joinRoom', function(roomNo) {
		roomNumber = roomNo;
		socket.join(roomNumber);
		console.log('client joined room ' + roomNumber);
		
		clientsInRoom = io.sockets.adapter.rooms[roomNumber].length;
		socket.broadcast.to(roomNumber).emit('connectToRoom', clientsInRoom + ' client(s) in room now');
	});
	
//	ss(socket).on('audioBuffer', function(audioBuffer){ // enable for socket streaming
	socket.on('audioBuffer', function(audioBuffer){
		socket.broadcast.to(roomNumber).emit('communicate', audioBuffer);
	});
	 
	socket.on('disconnect', function () {
		clients--;
		io.sockets.emit('broadcast', clients + ' client(s) connected total');
    });
});

http.listen(port, function(){
  console.log('listening on localhost:' + port);
});

