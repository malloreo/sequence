$(document).ready(function(){
	var hand = [];
	var name;
	var opponent;
	var myColor;
	var oppColor;
	var turn;
	var socket = io.connect('/');
	var resize = false;
	var viewAll;

	function doXMLHttpRequest() {
		var xhr = new XMLHttpRequest(); 	
		xhr.onreadystatechange=function()  {
			if (xhr.readyState==4) {
				if(xhr.status == 200) {
					table.innerHTML += xhr.responseText;
				} else {
					table.innerHTML ="Error code " + xhr.status;
	    		}
	   		}
	  	}
		xhr.open("GET", "htmlTable.txt", true);
		xhr.send(null); 
	} 

	$('#submitUser').click(function(){
		viewAll = false;
	    var uname = $('#user').val();
		name = uname;
		localStorage.name = name;
		$("#user").val("");
		$("#welcome").slideDown();
		$("#welcome").html("Welcome " + localStorage.name + "!");
	    socket.emit("submitPlayer", {name: uname});
	});

	socket.on('restarting', function(data) {
		$('#enterUser').fadeIn();
		$("#welcome").fadeOut();
		$("#waiting").fadeOut();
		$("#chatMessages").html("");
	})

	socket.on('waiting', function(data) {
		$('#enterUser').fadeOut();
		$('#waiting').slideDown();
	});

	socket.on('overQuorum', function(data) {
		$("#enterUser").fadeOut();
		$("#overQuorum").slideDown();
	});

	socket.on('putDB', function(data){
		var date = new Date();
		$.ajax({
			url: "addgame",
			type: "put",
			data: {	
				player1: data.player1,
				player2: data.player2,
				date: date.toDateString(),
				time: date.toTimeString()
			},
			success: function(data) {
			}
		});
	})

	$("#getDB").click(function(){
		$.ajax({
			url: "getgames",
			type: "get",
			data: {
			},
			success: function(data) {
				//Database information retrieve successful
				showGamesHistory(data);
			}
		});
		return false;
	});

	function showGamesHistory(db) {
		db.reverse();
		$("#game-history-page").fadeIn();
		if (db.length < 10){var len = db.length;}
		else{var len = 10;}
		var str = "<h2>Past " + len+ " Games Played</h2>"; 
		str += "<table id='history-table' border='1'><tr><th>Player 1</th><th>Player 2</th><th>Date</th><th>Time</th></tr>";
		for (var i=0;i<len;i++){
			str += "<tr><td>"
			var p1 = db[i].player1;
			str += p1 + "</td><td>";
			var p2 = db[i].player2;
			str += p2 + "</td><td id='date'>";
			var date = db[i].date;
			str += date + "</td><td id='time'>";
			var time = db[i].time;
			str += time + "</td></tr>";
		}
		str += "</table>";
		$("#history").html(str);
	}

	$("#game-history-page").click(function() {
		$(this).fadeOut();
	});

	socket.on('play', function(data) {
		$('#enterUser').fadeOut();
		$("#waiting").slideUp();
		$("#board").slideDown();
		$("#table").html("");
		$("#hand").slideDown();
		$("#turn").slideDown();
		$("#turn-mobile").slideDown();
		$("#opponent").slideDown();
		$("#color").slideDown();
		doXMLHttpRequest();
		$("#opponent").html("Your opponent is " + data.opponent);
		opponent = data.opponent;
		$("#color").html("You are the " + data.color + " token");
		turn = data.turn
		if (turn){
			$("#turn").html("It is Your Turn!");
			$("#turn-mobile").html("It is your Turn!");
		}
		else{
			$("#turn").html("It is your Opponent's Turn.");
			$("#turn-mobile").html("It is your Opponent's Turn.");
		}
		var imgLink = "<img src='../images/";
		var count = $("#handSpan > img").size();
		if (count == 0){
			for (var i=0;i<data.hand.length;i++){
				hand.push(data.hand[i]);
				$("#handSpan").append(imgLink + data.hand[i] + ".png'>");
			}
			if (!resize){resizeLogo();resize=true;};
			myColor = data.color;
			oppColor = data.oppColor;
		}
		checkJacks();
		$("#chat-title").slideDown();
		$("#chatMessages").slideDown();
		$("#message").slideDown();
		$("#sendMessage").slideDown();
		$("#viewAll").slideDown();
		$("#getDB").slideDown();
	});

	function resizeLogo(){
		var width_value = $('#logo').width()/2;
		var height_value = $('#logo').height()/2;
		w_ratio = width_value/$('#logo').width();
		if(!height_value){
			height_value = $('#logo').height()*w_ratio;
		}
		if(width_value>4 && height_value>4)
		{
			$('#logo').animate({ width: width_value, height: height_value}, 'fast', 
				function(){
					$('.widthvalue').html($('#logo').width()+'px');
					$('.heightvalue').html($('#logo').height()+'px');
				});
		}
	};

	function checkJacks(){
		if (hand.indexOf("cj") != -1 || hand.indexOf("dj") != -1){ //if you have a two-eyed jack
			$("#jack2eyedtip").fadeIn();
		}
		else{
			$("#jack2eyedtip").fadeOut();
		}
		if (hand.indexOf("hj") != -1 || hand.indexOf("sj") != -1){ //if you have a one-eyed jack
			$("#jack1eyedtip").fadeIn();
		}
		else{
			$("#jack1eyedtip").fadeOut();
		}
	};

	$("#instructions").click(function() {
		$('#instructions-page').fadeIn();
	});

	$("#instructions-page").click(function() {
		$(this).fadeOut();
	});

	$("#alert-page").click(function() {
		$(this).fadeOut();
	});

	$("#win-page").click(function() {
		$(this).fadeOut();
		$("#hand").slideUp();
		$("#handSpan").html("");
		$("#board").slideUp();
		$("#welcome").html("");
		$("#opponent").html("");
		$("#color").html("");
		$("#turn").html("");
		$("#turn-mobile").html("");
		$("#jack2eyedtip").slideUp();
		$("#jack1eyedtip").slideUp();
		$("#viewAll").slideUp();
		$("#chat-title").slideUp();
		$("#chatMessages").slideUp();
		$("#message").slideUp();
		$("#sendMessage").slideUp();
		$("#getDB").slideUp();
		hand = [];
		name = "";
		opponent = "";
		myColor = "";
		oppColor = "";;
		socket.emit("restartGame");
	})

	$("#viewAll")
	.click(function() {
		//mouse down
		if ($(this).html() == "View All Possible Moves"){
			viewAll = true;
			//Make all possible moves visible with a yellow border around the space.
			if (hand.indexOf("cj") != -1 || hand.indexOf("dj") != -1){
				var allCells = $("td");
				for (var i=0;i<allCells.length;i++){
					var card = $(allCells[i]).attr("class");
					if (!$(allCells[i]).attr("occupied") && card != "wild"){
						$("#"+allCells[i].id).css("border", "5px");
						$("#"+allCells[i].id).css("border-style", "solid");
						$("#"+allCells[i].id).css("border-color", "#ffff00");
						$(this).html("Hide All Possible Moves");
					}
				}
			}
			if (hand.indexOf("hj") != -1 || hand.indexOf("sj") != -1 ){
				var allCells = $("td");
				for (var i=0;i<allCells.length;i++){
					if( $(allCells[i]).attr("occupied") && $(allCells[i]).attr("occupiedBy") == oppColor){
						$("#"+allCells[i].id).css("border", "5px");
						$("#"+allCells[i].id).css("border-style", "solid");
						$("#"+allCells[i].id).css("border-color", "#ffff00");
						$(this).html("Hide All Possible Moves");
					}
				}
			}
			
			for (var i=0;i<hand.length;i++){
			//CHANGE if occupied already
				var arr = $("."+hand[i]);
				for (var j=0; j< arr.length; j++){
					if (!$(arr[j]).attr("occupied")){
						var position = arr[j].id;
						$("#"+position).css("border", "5px");
						$("#"+position).css("border-style", "solid");
						$("#"+position).css("border-color", "#ffff00");
						$(this).html("Hide All Possible Moves");
					}
				}
			}
		}
		//mouse up
		else{
			viewAll = false;
			//Reset board to normal, get rid of any yellow borders.
			var allCells = $("td");
			for (var i=0;i<allCells.length;i++){
				$("#"+allCells[i].id).css('border', "1px");
				$("#"+allCells[i].id).css('border-color', 'none');
				$(this).html("View All Possible Moves");
			}
		};
	});

	$("#table").on("mouseenter", "td", function() {
		if (!viewAll){
			var card = $(this).attr("class");
			if (hand.indexOf(card) != -1 && !$(this).attr("occupied")){
				var imgLink = "../images/" + card + ".png";
				$(this).css('border', "5px");
				$(this).css('border-style', "solid");
				$(this).css('border-color', '#ffff00');
			};
		}
	})

	$("#table").on("mouseleave", "td", function() {
		if (!viewAll){
			var card = $(this).attr("class");
			if (hand.indexOf(card) != -1 && !$(this).attr("occupied")){
				var imgLink = "../images/" + card + ".png";
				$(this).css('border', "1px");
				$(this).css('border-color', 'none');
			};			
		}

	});

	$("#table").on("click", "td", function() {
		var card = $(this).attr("class");
		var position = $(this).attr("id");
		if (!turn){ //Check if it is your turn
			$("#alert-page").fadeIn();
			$("#alert-message").html("It is not your turn yet. Please wait for your opponent to complete his/her turn.");
		}
		else if($(this).attr("class") == "wild"){ //Check if you have clicked on a free space
			$("#alert-page").fadeIn();
			$("#alert-message").html("You cannot place a token on a Free Space. Both players may use the 4 corners to his/her advantage without placing a token on it.");
		}
		else{
			if ($(this).attr("occupied")){ //Check if you clicked on an already occupied space
				if (hand.indexOf("sj") == -1 && hand.indexOf("hj") == -1){
					$("#alert-page").fadeIn();
					$("#alert-message").html("You cannot place a token in this space because this space has already been taken by you or your opponent. <br> Tip: You can remove an opponent's token when you have a One-Eyed Jack in your hand.");
				}
				else if ($(this).attr("occupiedBy") == myColor ) {
					// alert("don't remove your own piece silly"); //**** REMOVE
					$("#alert-page").fadeIn();
					$("#alert-message").html("Don't click on your own piece silly<br>You have a Two-Eyed Jack in your hand. Use it to remove one of your opponent's token (not your own).");
				}
				else{
					//Remove Token!
					if (hand.indexOf("sj") != -1){
						removeToken($(this), position, "sj", card);
					}
					else if(hand.indexOf("hj") != -1){
						removeToken($(this), position, "hj", card);
					}
				}
			}
			else if (hand.indexOf(card) == -1){ //Check if you have clicked on a space but you don't have the card for it
				//If you have a Two-Eyed Jack (clubs or diamonds), you can place it
				if (hand.indexOf("cj") == -1 && hand.indexOf("dj") == -1){
					$("#alert-page").fadeIn();
					$("#alert-message").html("You cannot place a token in this space because you do not have this card in your hand.<br> Tip: You can only place a token in a space where you don't have a card for when you have a Two-Eyed Jack in your hand.");
				}
				else{
					if (hand.indexOf("cj") != -1){
						placeToken($(this), position, "cj");						
					}
					else if(hand.indexOf("dj") != -1){
						placeToken($(this), position, "dj");
					}
				}
			}
			else{
				placeToken($(this), position, card);
			}
		}
	});

	function placeToken(here, position, card){
		here.css('border', "1px");
		here.css("border-color", "#000000");
		here.css("background-image", 'url("../images/'+myColor+'.png")');
		sendToOpponent(here, position, card);
	}

	function sendToOpponent(here, position, card){
		//Place this token on opponent's board.
		socket.emit('putTokenOnOpponentsBoard', {position: position, color: myColor, card: card});
		here.attr("occupied", true);
		here.attr("occupiedBy", myColor);

		// request new card from server (emit 'drawOne') --> serverSocket: (on 'drawOne'), emit('receiveOne') --> clientSocket: (on 'receiveOne'), hand.push()
		socket.emit('drawOne', {card: card, position: position});
		turn = false;
		$("#turn").html("It is your Opponent's Turn");
		$("#turn-mobile").html("It is your Opponent's Turn");
	}

	function removeToken(here, position, card, origCard){
		here.css('border', "1px");
		here.css("border-color", "#000000");
		here.css("background-image", 'url("../images/'+origCard+'.png")');
		sendToOpponentRemove(here, position, card, origCard);
	}

	function sendToOpponentRemove(here, position, card, origCard){
		//Place this token on opponent's board.
		socket.emit('removeTokenOnOpponentsBoard', {position: position, orig: origCard});
		here.removeAttr("occupied");
		here.removeAttr("occupiedBy");

		// request new card from server (emit 'drawOne') --> serverSocket: (on 'drawOne'), emit('receiveOne') --> clientSocket: (on 'receiveOne'), hand.push()
		socket.emit('drawOne', {card: card});//, position: position});
		turn = false;
		$("#turn").html("It is your Opponent's Turn");
		$("#turn-mobile").html("It is your Opponent's Turn");
	}

	socket.on('getNewCard', function(data){
		var oldCard = data.oldCard;
		var newCard = data.newCard;
		var ind = hand.indexOf(oldCard);
		var str = "";
		for (var i=0;i<hand.length;i++){
			var imgLink = "";
			if (i== ind){
				imgLink = "<img src='../images/"+newCard+".png'>";
				hand[i] = newCard;
			}
			else{
				imgLink = "<img src='../images/"+hand[i]+".png'>";
			}
			str += imgLink;
		}
		$("#handSpan").html(str);
		checkJacks();
	});

	socket.on('getOpponentsMove', function(data){
		var color = data.oppColor;
		var position = data.position;
		var card = data.card;
		$("#"+position).css("background-image", 'url("../images/'+color+'.png")');
		$("#"+position).attr("occupied", true);
		$("#"+position).attr("occupiedBy",color);
		turn = true;
		$("#turn").html("It is Your Turn!");
		$("#turn-mobile").html("It is Your Turn!");
	});

	socket.on("removeOpponentsMove", function(data){
		var card = data.card
		var position = data.position;
		$("#"+position).css("background-image", 'url("../images/'+card+'.png")');
		$("#"+position).removeAttr("occupied");
		$("#"+position).removeAttr("occupiedBy");
		turn = true;
		$("#turn").html("It is Your Turn!");
		$("#turn-mobile").html("It is Your Turn!");

	})

	socket.on('quit', function(data){
		$("#win-page").fadeIn();
		$("#win-message").html("Your opponent has quit the game. <br> You Win!")
	})

	socket.on('youwin', function(data){
		$("#win-page").fadeIn();
		$("#win-message").html("Congratulations! You Won!");
	})

	socket.on('youlose', function(data){
		$("#win-page").fadeIn();
		$("#win-message").html("Awww, You Lost!");
	})

	$("#sendMessage").click(function(){
		var msg = $("#message").val();
		if (msg != ""){
			$("#message").val("");
			$("#chatMessages").append(name + ": " + msg + "<br>");
			socket.emit("sendchat", {msg: msg, name:name});
		}
	})

	socket.on('receiveMsg', function(data){
		$("#chatMessages").append(data.name + ": " + data.msg + "<br>");
	})

	

});