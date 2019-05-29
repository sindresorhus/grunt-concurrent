'use strict';
const net = require('net');

const server = net.createServer(socket => {
	socket.write('Hello world').pipe(socket);
});

server.listen(0, '127.0.0.1');
