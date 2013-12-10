var util = require("util");

//db/:collection/:operation/:document
var doError = function(e) {
        util.debug("ERROR: " + e);
        throw new Error(e);
    }

/******************************************************************
 *   Replace with your credentials
 *****************************************************************/
var mongodb = require('mongodb');
var db = new mongodb.Db('nodejitsu_malloryw_nodejitsudb5839934484', new mongodb.Server('ds045988.mongolab.com', 45988, {}));
db.open(function (err, db_p) {
	if (err) { throw err; }
		db.authenticate('nodejitsu_malloryw', '5ejfret95ts0nd2s1l7qvtl4is', function (err, replies) {
		// You are now connected and authenticated.
	});
});

// INSERT
exports.insert = function(collection, query, callback) {
    db.collection(collection).insert(query, {
        safe: true
    }, function(err, crsr) {
        callback(crsr);
    });
}

// FIND
exports.find = function(collection, query, callback) {
    var crsr = db.collection(collection).find();
    crsr.toArray(function(err, docs) {
        if (err) doError(err);
        callback(docs);
    });
 }

// UPDATE //Not used in this project
// exports.update = function(collection, query, callback) {
//     db.collection(collection).update(JSON.parse(query.find), JSON.parse(query.update), {
//         new: true
//     }, function(err, crsr) {
//         if (err) doError(err);
//         callback('Update succeeded');
//     });
//   }
