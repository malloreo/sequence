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

deck = shuffleDeck(deck);

module.exports = deck;