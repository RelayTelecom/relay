var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

var socketStream = require('socket.io-stream');

const port = 8642;

app.get('/', function(req, res){
	res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

var clients = 0;

io.on('connection', function(socket){
	clients++;
	
	io.sockets.emit('broadcast',{ description: clients + ' clients connected!'});
	
	socketStream(socket).on('audioBuffer',function(audioBuffer){
//		console.log(audioBuffer);
	});
	 
	socket.on('disconnect', function () {
		clients--;
		io.sockets.emit('broadcast',{ description: clients + ' clients connected!'});
    });
});

http.listen(port, function(){
  console.log('listening on localhost:' + port);
});

