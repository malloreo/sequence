var mongo = require("../models/myMongo.js");

var collection = "games";

exports.addgame = function(req, res){
 	var game = {
 		player1: req.body.player1,
 		player2: req.body.player2,
 		date: req.body.date,
 		time: req.body.time
 	};
    mongo.insert(collection, game, function(){
    	res.end();
    });
};

exports.getgames = function(req, res){
	mongo.find(collection, "", function(model){
		res.send(model);
		res.end();
	});

}