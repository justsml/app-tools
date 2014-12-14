"use strict";
var mongoose = require('mongoose')
		

/*

Example:
var Cache = require('app/cache')
var cache = new Cache(req.app.db, 'propertydetailscache')
cache.setItem('')
*/
var Cache = module.exports = function(db, collectionName) {
	var self = this;
	// EventEmitter.call(self);
	self.collectionName = collectionName || 'cache'
	self.db = db || null;
	// self.checkConnection(self.db, function(err, db) {
	// 	if ( err ) { throw err } // Should fail early if we don't have a db
	// 	if ( !db ) { throw new Error('Failed to connect to database') } // Should fail early if we don't have a db
	// })
}
// util.inherits(Cache, EventEmitter);

Cache.prototype.get = Cache.prototype.getItem = function(key, callback) {
	var self = this;
	self.checkConnection(self.db, function(err, db) {
		if ( err ) { return callback(err) } // Should fail early if we don't have a db
		if ( !db ) { return callback(new Error('Failed to connect to database')) } // Should fail early
		if ( db && db.collection ) {
			// db.collection(self.collectionName, function _getColl(err, c) {
				var c = self.model
				if ( !c ) { return callback(err, new Error('Error getting collection')) }
				c.find({_id: key}).exec(function(err, items) {
					callback(err, items && items[0] && items[0].data)
				})
			// })
		} else {
			return callback(new Error('Couldn\'t connect to db'))
		}
	})
}
Cache.prototype.set = Cache.prototype.setItem = function(key, value, callback) {
	var self = this;
	self.checkConnection(self.db, function(err, db) {
		if ( err ) { return callback(err) } // Should fail early if we don't have a db
		if ( !db ) { return callback(new Error('Failed to connect to database')) } // Should fail early if we don't 
		if ( db && db.collection ) {
			//db.collection(self.collectionName, function _getColl(err, c) {
				var c = self.model
				// if ( err ) { return callback(err, new Error('Error getting collection')) }
				// check if we need to remove instead of upsert
				if ( ! value ) {
					c.remove({_id: key}, {w: 0}, callback)
				} else {
					// WARNING: Upsert w/ no saftey
					c.update({_id: key}, {_id: key, data: value, timestamp: new Date()}, {upsert:true, w: 0}, callback)
				}
			// })
		} else {
			return callback(new Error('Couldn\'t connect to db'))
		}
	})
}
// Add this as a member method for now... should be private
Cache.prototype.checkConnection = function(db, callback) {
	var self = this
	if ( db ) {
		callback(null, db)
	} else {
		var mongoHost = process.env.MONGOCACHE_URI || process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || process.env.MONGO_URL || 'localhost:27017/cache'
		mongoHost = mongoHost.split('/')[0]
		mongoHost = mongoHost + '/' + (typeof(db) === 'string' ? db : 'cache');
		// console.log('Connecting to ', mongoHost)
		db = self.db = mongoose.createConnection('mongodb://' + mongoHost, {w: 0})
		db.on('error', function(err, db) {
			if(err) {
				self.error = err
				console.error('Mongo Failed Connection', err)
				return callback(err, null);
			}
		})
		db.once('open', function() {
			var CacheModel = require('./cache-schema')
			self.model = new CacheModel(db, self.collectionName)

			self.connecting = false
			self.ready = true
			self.db = db
			callback(null, db)
		})
	}

}

