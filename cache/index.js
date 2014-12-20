"use strict";
/*

Example:
var Cache = require('app-tools/cache')
// {db: mongodb_connection} is required
var cache = new Cache({ db: req.app.db }), 
var cache = new Cache({ 
	db: req.app.db,
	// OPTIONAL
	collectionName: 'httpcache',
	timeout: 86400,// default = 1 day
	autoExpire: true, //[true|false],
	w: 0 // ( set to 1 for safety, or 0 to wait for nothing! )
	)
cache.setItem('key', data, function (err, data) {
	
})
cache.setItem('key', data, function (err, data) {
	
})


Info:
Schema is like this:
	var schema = new Schema({
		_id: { type: String, required: true },
		data: { type: Object, default: null },
		createdDate: { type: Date, default: Date.now, expires: '1d' }
	});

*/
var Cache = module.exports = function(opts) {
	var self = this,
			debug = opts.debug;

	self.timeout = opts.timeout = opts.timeout || 86400// 1 day
	self.w = opts.w = opts.writeConcern || opts.w || 0
	// self.collection gets reused to hold the real collection later
	self.collectionName = typeof(opts.collection) === 'string' ? opts.collection : 'cache'
	self.collection = opts.collection || null
	self.db = opts.db || null;
	self.autoExpire = opts.autoExpire || true;
	// self.opts = opts
	// get the needed collection and cache it at self.collection as soon as we can
	if ( ! self.collection ) {
		_getCollection(self, function(err, c) {
			self.collection = c;
			// collection now cached at self.collection
			// make sure we have a valid 'expire index' - fire async at instance creation, Cache class instances should live for a while
			if ( ! opts.autoExpire ) {
				_checkIndexes(c);
			}
		})
	}
	if (!self.db) { throw new Error('Missing required option: {db: MongoClient}') }
	if (!self.collection || self.collection.length < 1) { throw new Error('Invalid collection name: {collection: "itemCache"}') }
	

	function _checkIndexes(collection) {
		if ( !self.indexCreated && self.autoExpire ) {
			self.indexCreated = true
			collection.ensureIndex( { "createdDate": 1 }, 
				{ expireAfterSeconds: self.timeout }, 
				function(err, idx) {
					// if (opts.debug) {console.warn('_checkIndexes', arguments);}
				}
			)
		}
	}
}
function _getCollection(self, cb) {
	if ( self.collection  && typeof(self.collection) !== 'string') {
		return cb(null, self.collection)
	} else if ( self.isDbValid() ) {
		self.db.collection(self.collectionName, function(err, col) {
			cb(err, col)
		})
	} else {
		throw new Error('Something unexpected happened, no collection retrieved.')
	}
}

Cache.prototype.isDbValid = function () {
	// need to do better here...
	return (this.db && this.db.collection) ? true : false 
}
Cache.prototype.get = Cache.prototype.getItem = function(key, callback) {
	var self = this,
			db = this.db;

	if ( !db ) { return callback(new Error('Failed to connect to database')) } // Should fail early if we don't 
	if ( self.isDbValid() ) {
		_getCollection(self, function _getColl(err, c) {
			if ( !c ) { return callback(err, new Error('Error getting collection')) }
			c.find({_id: key}).toArray(function(err, items) {
				callback(err, items && items[0] && items[0].data)
			})
		})
	} else {
		return callback(new Error('Couldn\'t connect to db'))
	}
}
Cache.prototype.set = Cache.prototype.setItem = function(key, value, callback) {
	var self = this, 
			db = this.db;
	callback = callback || function() { };

	if ( !db ) { return callback(new Error('Failed to connect to database')) } // Should fail early if we don't 
	if ( self.isDbValid() ) {
		_getCollection(self, function _getColl(err, c) {
			if ( err ) { return callback(err, new Error('Error getting collection')) }
			// check if we need to remove instead of upsert
			if ( ! value ) {
				c.remove({_id: key}, {w: self.w}, callback)
			} else {
				var fieldsToSave = { '_id': key, 'data': value, 'createdDate': new Date() }
				// WARNING: Upsert w/ no saftey
				c.update({_id: key}, fieldsToSave, {upsert: true, w: self.w}, callback)
			}
		})
	} else {
		return callback(new Error('Couldn\'t connect to db'))
	}

}


