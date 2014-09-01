'use strict';
var net = require('net');

var server = net.createServer(function (socket) {
	socket.write('Hello world').pipe(socket);
});

server.listen(0, '127.0.0.1');
