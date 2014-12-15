"use strict";
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
}
Cache.prototype.checkIndexes = function(collection) {
	var self = this;
	if ( ! self.indexChecked ) {
		collection.ensureIndex( { "createdDate": 1 }, { expireAfterSeconds: (2 * 24 * 60 * 60) } )
	}
	self.indexChecked = true
}
Cache.prototype.getItem = function(key, callback) {
	var self = this;
	var db = self.db
	if ( !db ) { return callback(new Error('Failed to connect to database')) } // Should fail early if we don't 
	if ( db && db.collection ) {
		db.collection(self.collectionName, function _getColl(err, c) {
			self.checkIndexes(c)
			if ( !c ) { return callback(err, new Error('Error getting collection')) }
			c.find({_id: key}).toArray(function(err, items) {
				callback(err, items && items[0] && items[0].data)
			})
		})
	} else {
		return callback(new Error('Couldn\'t connect to db'))
	}
}
Cache.prototype.setItem = function(key, value, callback) {
	var self = this;
	var db = self.db
	if ( !db ) { return callback(new Error('Failed to connect to database')) } // Should fail early if we don't 
	if ( db && db.collection ) {
		db.collection(self.collectionName, function _getColl(err, c) {
			self.checkIndexes(c)
			if ( err ) { return callback(err, new Error('Error getting collection')) }
			// check if we need to remove instead of upsert
			if ( ! value ) {
				c.remove({_id: key}, {w: 0}, callback)
			} else {
				var fieldsToSave = { '_id': key, 'data': value, 'createdDate': new Date() }
				// WARNING: Upsert w/ no saftey
				c.update({_id: key}, fieldsToSave, {upsert:true, w: 0}, callback)
			}
		})
	} else {
		return callback(new Error('Couldn\'t connect to db'))
	}

}


