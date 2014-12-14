"use strict";
var MongoClient = require('mongodb').MongoClient,
		ObjectID = require('mongodb').ObjectID
/*

Example:
var Cache = require('app/cache')
var cache = new Cache(req.app.db, 'propertydetailscache')
cache.setItem('')
*/
var Cache = module.exports = function(db, collectionName) {
	var self = this;
	self.collectionName = collectionName || 'cache'
	self.db = db || null;
	checkConnection(self.db, function(err, db) {
		if ( err ) { throw err } // Should fail early if we don't have a db
		if ( !db ) { throw new Error('Failed to connect to database') } // Should fail early if we don't have a db
		self.db = db
	})
}
Cache.prototype.getItem = function(key, callback) {
	var self = this;
	var db = self.db;
	if ( db && db.collection ) {
		db.collection(self.collectionName, function _getColl(err, c) {
			if ( err ) { return callback(err, c) }
			c.find({_id: key}, function _find(err, data) {
				// console.warn('FIND RESULTS', err, data)
				callback(err, data)
			})
		})
	} else {
		return callback(new Error('Couldn\'t connect to db'))
	}
}
Cache.prototype.setItem = function(key, value, callback) {
	var self = this;
	var db = self.db;
	if ( db && db.collection ) {
		db.collection(self.collectionName, function _getColl(err, c) {
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
}
function checkConnection(db, callback) {
	if ( db && db.collection ) {
		callback(null, db)
	} else {
		var mongoHost = process.env.MONGOCACHE_URI || process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || process.env.MONGO_URL || 'localhost:27017/cache'
		mongoHost = mongoHost.split('/')[0]
		mongoHost = mongoHost + '/' + (typeof(db) === 'string' ? db : 'cache');
		MongoClient.connect('mongodb://' + mongoHost, function(err, db) {
			if(err) {
				console.error('Mongo Failed Connection', err)
				return callback(err, null);
			}
			callback(err, db)
		});
	}
}

