"use strict";
var MongoClient = require('mongodb').MongoClient

var Cache = require('../'),
		cache = null,
		assert = require('better-assert'),
		db = null,
		connecting = false;

var tinyKey = 'tiny'
var medKey = 'key_really_long_key_really_long_key_real'//40 chars
var bigKey = 'long_key_really_long_key_really_long_key_really_long_key_really_long_key_really_long_key_really_long_key_really_long_key_really_long_key_really_long_key_really_long_key_really_long_key_really_long_key_really_long_key_really_long_key_really_long_key_really_long_key_really_long_key_really_long_key_really_long_key_really_long_key_really_long_key_really_long_key_really_long_key_really_long_key_really_long_key_really_long_key_really_long_key_really_long_key_really_long_key_really_long_key_really_long_key_really_long_key_really_long_key_really_long_key_really_long_key_really_long_key_really_long_key'

// var cache = new Cache(null, 'cache')
// Add this as a member method for now... should be private
function getConnection(callback) {
	if ( db && db.collection ) {
		callback(null, db)
	} else if (connecting) {
		setTimeout(function() {
			callback(null, db)
		}, 250)
	} else {
		connecting = true // WARNING: This pattern is NOT thread-safe!!
		MongoClient.connect('mongodb://localhost:27017/test_cache', {w: 1}, function(err, dbase) {
			if (err) {
				console.error('Mongo Failed Connection', err)
				return callback(err, null);
			}
			db = dbase
			cache = new Cache(db)
			callback(err, db)
		})
	}
}

describe('Module: app-tools/cache', function() {
	it('init: connected to DB', function(done) {
		getConnection(function(err, db) {
			cache = new Cache({
				'w': 1,
				'db': db});
			assert(cache !== null)
			done();
		})
	})
	it('Create cache', function(done) {
		done();
	})
	it('Check methods', function(done) {
		if (! cache.setItem) {
			throw new Error('setItem not found')
		}
		if (! cache.getItem) {
			throw new Error('getItem not found')
		}
		done();
	});

	it('Save Small Key', function(done) {
		cache.setItem(tinyKey, {foo: 'bar'}, function(err, count) {
			assert(null === err)
			assert(count.result.ok)
			done()
		})
	})
	it('Can Save 40 Char Key', function(done) {
		cache.setItem(medKey, {foo: 'bar'}, function(err, count) {
			assert(null === err)
			assert(count.result.ok)
			done()
		})
	})

	it('Can Save 600 Char Key', function(done) {
		cache.setItem(bigKey, {foo: 'bar'}, function(err, count) {
			assert(null === err)
			assert(count.result.ok)
			done()
		})
	})

	it('Can Get Saved Item (25ms delay)', function(done) {
		// wait after a timeout -- we don't use write sync
		setTimeout(function() {
			cache.getItem(tinyKey, function(err, result) {
				// console.log('GET', arguments)
				assert(null === err)
				assert(result.foo === 'bar')
				done()
			})
		}, 25)
	})

	it('Can Delete Saved Items (25ms delay)', function(done) {
		setTimeout(function() {
			var count = 3
			cache.setItem(tinyKey, null, function(err) {
				assert(null === err)
				count--;
				if (count===0) done()
			})
			cache.setItem(medKey, null, function(err) {
				assert(null === err)
				count--;
				if (count===0) done()
			})
			cache.setItem(bigKey, null, function(err) {
				assert(null === err)
				count--;
				if (count===0) done()
			})
		}, 25);
	})

})
