var express = require('express');
var http = require('http');
var path = require('path');
var server = express();
server.set('port', process.env.PORT || 3000);
server.set('views', path.join(__dirname, 'views'));
server.set('view engine', 'jade');
server.use(server.router);
server.use(express.static(path.join(__dirname, 'public')));
http.createServer(server).listen(server.get('port'), function () {
    console.log('Express server listening on port ' + server.get('port'));
});
