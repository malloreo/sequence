var express = require('express')
  , http = require('http')
  , path = require('path')
  , sio = require('socket.io')
  , gameSockets = require('./routes/serverSocket.js')
  , games = require('./routes/games.js');
  
var app = express();

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger('tiny'));
  app.use(express.bodyParser());  // Parse the request body into req.body object
  app.use(express.methodOverride()); // Allows you to override HTTP methods on old browsers
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.errorHandler());
});

app.put('/addgame', games.addgame);
app.get('/getgames', games.getgames);

var server = http.createServer(app);
var io = sio.listen(server);
server.listen(44444, function(){
  console.log("Express server listening on port 44444");
	});
gameSockets.init(io);