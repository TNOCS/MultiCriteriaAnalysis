var express = require('express');
var http = require('http');
var path = require('path');

var server = express();

// all environments
server.set('port', process.env.PORT || 3000);
server.set('views', path.join(__dirname, 'views'));
server.set('view engine', 'jade');

//server.set('view engine', 'html');
//server.engine('html', require('jade').renderFile);
server.use(express.favicon());
server.use(express.logger('dev'));
server.use(express.json());
server.use(express.urlencoded());
server.use(express.methodOverride());
server.use(server.router);

server.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == server.get('env')) {
    server.use(express.errorHandler());
}

//server.get('/', (req, res) => {
//    res.render('index.html');
//});
//server.get('/', routes.index);
//server.get('/users', user.list);
http.createServer(server).listen(server.get('port'), function () {
    console.log('Express server listening on port ' + server.get('port'));
});
//# sourceMappingURL=server.js.map
