var emptyBoard = require('../models/emptyBoard.js');
var deck = require('../models/deck.js');
var quorum = 2; //2 player game. only allow 2 sockets to play.
var players = {}; //javascript object in the format of player#:name
var play;
var socketsPlaying = []; //stores all sockets that have entered in a username.
var socketsOnlyConnected = []; //stores all sockets that have connected and have not entered in a username

exports.init = function(io) {
  	// When a new connection is initiated
	io.sockets.on('connection', function (socket) {
		socketsOnlyConnected.push(socket);

		socket.on('submitPlayer', function(data){
			if (socketsPlaying.length == quorum){
				socket.emit("overQuorum");
			}
			else{
				socketsPlaying.push(socket);
				socketsOnlyConnected.splice(socket,1);
				if (socketsPlaying.length < quorum){
					players.player1 = data.name;
					socket.emit('waiting');
				}
				else if (socketsPlaying.length == quorum){
					players.player2 = data.name;
					play = true;
					socket.emit('putDB', {player1: players.player1, player2:players.player2});
					socket.emit('play', {hand: getHand(), color: "blue", oppColor: "green", opponent: players.player1, turn: true});
					var ind = socketsPlaying.indexOf(socket);
					if (ind ==0){var s = 1;}
					else{ var s = 0;}
					socketsPlaying[s].emit('play', {hand: getHand(), color: "green", oppColor: "blue", opponent: players.player2, turn: false});
				}
			}
		});

		function getHand(){
			var hand = [];
			for (var i=0;i<7;i++){
				if (deck.length == 0){
					deck = require('../models/deck.js');
				}
				hand.push(deck.pop());
			};
			return hand;
		};

		socket.on('putTokenOnOpponentsBoard', function(data){
			socket.broadcast.emit('getOpponentsMove', {position: data.position, oppColor: data.color, card: data.card});
			var arr = data.position.split("_");
			var row = arr[1];
			var col = arr[2];
			emptyBoard[row][col] = data.color;
			var cw = checkWins(data.color);
			if (cw){
				socket.emit('youwin');
				socket.broadcast.emit('youlose');
			}
		});

		socket.on('removeTokenOnOpponentsBoard', function(data){
			socket.broadcast.emit('removeOpponentsMove', {position:data.position, card: data.orig});
			var arr = data.position.split("_");
			var row = arr[1];
			var col = arr[2];
			emptyBoard[row][col] = "-"; //make the cell in 10x10 array blank

		})

		function checkWins(color){
			return (checkHorizontal(color) || checkVertical(color) || checkLowDiagonal(color) || checkHighDiagonal(color));
		}

		function checkHorizontal(color){
			//check if there are 5 adjacent pieces in a horizontal row.
			for (var i=0;i<10;i++){
				for (var j=0;j<6;j++){
					if ((emptyBoard[i][j] == color || emptyBoard[i][j] == "wild") &&
						(emptyBoard[i][j+1] == color || emptyBoard[i][j+1] == "wild") &&
						(emptyBoard[i][j+2] == color || emptyBoard[i][j+2] == "wild") &&
						(emptyBoard[i][j+3] == color || emptyBoard[i][j+3] == "wild") &&
						(emptyBoard[i][j+4] == color || emptyBoard[i][j+4] == "wild")){
						return true;
					} 				
				}
			}
			return false;
		}

		function checkVertical(color){
			//check if there are 5 adjacent pieces in a vertical column.
			for (var i=0;i<6;i++){
				for (var j=0;j<10;j++){
					if ((emptyBoard[i][j] == color || emptyBoard[i][j] == "wild") &&
						(emptyBoard[i+1][j] == color || emptyBoard[i+1][j] == "wild") &&
						(emptyBoard[i+2][j] == color || emptyBoard[i+2][j] == "wild") &&
						(emptyBoard[i+3][j] == color || emptyBoard[i+3][j] == "wild") &&
						(emptyBoard[i+4][j] == color || emptyBoard[i+4][j] == "wild")){
						return true;
					}
				}
			}
			return false;
		}

		function checkLowDiagonal(color){
			//check if there are 5 adjacent pieces in a diagonal line with negative slope: \
			for (var i=0;i<6;i++){
				for (var j=0;j<6;j++){
					if ((emptyBoard[i][j] == color || emptyBoard[i][j] == "wild") &&
						(emptyBoard[i+1][j+1] == color || emptyBoard[i+1][j+1] == "wild") &&
						(emptyBoard[i+2][j+2] == color || emptyBoard[i+2][j+2] == "wild") &&
						(emptyBoard[i+3][j+3] == color || emptyBoard[i+3][j+3] == "wild") &&
						(emptyBoard[i+4][j+4] == color || emptyBoard[i+4][j+4] == "wild")){	
						return true;
					}
				}
			}
			return false;
		}

		function checkHighDiagonal(color){
			//check if there are 5 adjacent pieces in a diagonal line with positive slope: /
			for (var i=9;i>3;i--){
				for (var j=0;j<6;j++){
					if ((emptyBoard[i][j] == color || emptyBoard[i][j] == "wild") &&
						(emptyBoard[i-1][j+1] == color || emptyBoard[i-1][j+1] == "wild") &&
						(emptyBoard[i-2][j+2] == color || emptyBoard[i-2][j+2] == "wild") &&
						(emptyBoard[i-3][j+3] == color || emptyBoard[i-3][j+3] == "wild") &&
						(emptyBoard[i-4][j+4] == color || emptyBoard[i-4][j+4] == "wild")){		
						return true;
					}
				}
			}
			return false;
		}

		socket.on('drawOne', function(data) {
			//draw a card from the deck and update the socket's hand.
			var card = data.card;
			if (deck.length ==0){
				deck = require('../models/deck.js');
			}
			var newCard = deck.pop();
			socket.emit('getNewCard', {newCard: newCard, oldCard: card});
		})
		
		socket.on('restartGame', function(data) {
			play = false;
			var ind = socketsPlaying.indexOf(socket);
			socketsPlaying.splice(ind, 1);
			socketsOnlyConnected.push(socket);
			players = {};
			emptyBoard = [["wild", "-", "-", "-", "-", "-", "-", "-", "-","wild"],
									["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
									["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
									["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
									["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
									["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
									["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
									["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
									["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
									["wild", "-", "-", "-", "-", "-", "-", "-", "-","wild"]];
			if (deck.length != 104){
				deck = getNewDeck();
			}
			socket.emit('restarting', {emptyBoard:emptyBoard, deck:deck});
		})

		socket.on('disconnect', function () {
			if (socketsOnlyConnected.indexOf(socket) != -1){
				var ind = socketsOnlyConnected.indexOf(socket);
				socketsOnlyConnected.splice(ind, 1);
			}
			else if (socketsPlaying.indexOf(socket) != -1){ //this socket was playing
				var ind = socketsPlaying.indexOf(socket);
				socketsPlaying.splice(ind,1);

				if (socketsPlaying.length == 1){
					socketsPlaying[0].emit("quit");
				}				
				else if (socketsOnlyConnected.length == 0 && socketsPlaying.length == 0){
					emptyBoard = [["wild", "-", "-", "-", "-", "-", "-", "-", "-","wild"],
									["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
									["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
									["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
									["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
									["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
									["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
									["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
									["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
									["wild", "-", "-", "-", "-", "-", "-", "-", "-","wild"]];
					deck = getNewDeck();
					players = {};
				}
			}
		});
		
		function getNewDeck(){
			//create a new deck and shuffle it.
			var spades = 	["sa", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10", "sj", "sq", "sk"];
			var diamonds =  ["da", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "d10", "dj", "dq", "dk"];
			var hearts = 	["ca", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10", "cj", "cq", "ck"];
			var clubs =  	["ha", "h2", "h3", "h4", "h5", "h6", "h7", "h8", "h9", "h10", "hj", "hq", "hk"];

			var deck = [];

			//Create a deck of 104 cards (2 standard 52-card decks)
			for (var i=0;i<2;i++){
				for (var card=0;card<13;card++){
					deck.push(spades[card]);
					deck.push(diamonds[card]);
					deck.push(hearts[card]);
					deck.push(clubs[card]);
				}
			}

			function randInt (min, max) {
			    return Math.floor(Math.random() * (max - min + 1)) + min;
			}

			//Shuffle Deck Algorithm
			function shuffleDeck (deck) {
				for (var i=0;i<deck.length-1;i++) {
					var r = randInt(i+1,deck.length-1);
					var temp = deck[i];
					deck[i] = deck[r];
					deck[r] = temp;
				}
				return deck;
			}

			return(shuffleDeck(deck));
		}

		socket.on('sendchat', function(data){
			//pass chat messages between the 2 sockets.
			socket.broadcast.emit('receiveMsg', {msg: data.msg, name:data.name});
		})
	});
}