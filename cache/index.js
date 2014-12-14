"use strict";
var MongoClient = require('mongodb').MongoClient,
		ObjectID = require('mongodb').ObjectID;
/*

Example:
var Cache = Require('app/cache')
var cache = new Cache(req.app.db, 'propertydetailscache')
cache.setItem('')
*/
var Cache = module.exports = function(db, collectionName) {
	this.collectionName = collectionName || 'cache'
	this.db = db
}
Cache.prototype.getItem = function(key, callback) {
	checkConnection(this.db, function (db) {
		if ( db && db.collection ) {
			db.collection(this.collectionName, function _getColl(err, c) {
				if ( err ) { return callback(err, c) }
				c.find({_id: key}, function _find(err, data) {
					// console.warn('FIND RESULTS', err, data)
					callback(err, data)
				})
			})
		} else {
			return callback(new Error('Couldn\'t connect to db'))
		}
	})
}
Cache.prototype.setItem = function(key, value, callback) {
	checkConnection(this.db, function (db) {
		if ( db && db.collection ) {
			db.collection(this.collectionName, function _getColl(err, c) {
				if ( err ) { return callback(err, c) }
				// check if we need to remove instead of upsert
				if ( ! value ) {
					c.remove({_id: key}, callback)
				} else {
					value._id = key
					// WARNING: Upsert w/ no saftey
					c.update({_id: key}, value, {upsert:true, w: 0}, callback)
				}
			})
		} else {
			return callback(new Error('Couldn\'t connect to db'))
		}
	})
}
function checkConnection(db, callback) {
	if ( db && db.collection ) {
		callback(db)
	} else {
		MongoClient.connect('mongodb://127.0.0.1:27017/' (typeof(db) === 'string' ? db : 'cache'), function(err, db) {
			if(err) {
				console.error('Mongo Failed Connection', err)
				return callback(null);
			}
			callback(db)
		});
	}
}

