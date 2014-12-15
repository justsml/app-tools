"use strict";
var MongoClient = require('mongodb').MongoClient

var Cache = require('../')
// var cache = new Cache(null, 'cache')
var cache = null
var assert = require('assert');
var db = null,
	connecting = false;
var idKey = 'http://api.realtytrac.com/search/all/3560%209th%20St.%2C%20Boulder%2C%20CO%2080304?format=json&borrower=&count=10&ApiKey=c7d06fc1-d13d-4ae4-bff8';
// Add this as a member method for now... should be private
function getConnection(callback) {
	if ( db && db.collection ) {
		cache = new Cache(db)
		callback(null, db)
	} else if (connecting) {
		setTimeout(function() {
			cache = new Cache(db)
			callback(null, db)
		}, 250)
	} else {
		connecting = true // WARNING: This pattern is NOT thread-safe!!
		MongoClient.connect('mongodb://localhost:27017/cache', {w: 1}, function(err, dbase) {
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
  it('Connected to DB', function() {
		getConnection(function(err, db) {
			assert.ok(cache)
		})
	})
	it('Check methods', function(done) {
		getConnection(function(err, db) {
			if (! cache.setItem) {
				throw new Error('setItem not found')
			}
			if (! cache.getItem) {
				throw new Error('getItem not found')
			}
			done()
		});
	});

  it('Save Item', function(done) {
		getConnection(function(err, db) {
			cache.setItem(idKey, {foo: 'bar'}, function(err, count) {
				// console.log('SET', arguments)
				assert.equal(null, err)
				assert.ok(count.result.ok) // handle response if { w: 0 } or 1
				// assert.ok(!count || count === 1) // handle response if { w: 0 } or 1
				done()
			})
		})
	})


  it('Get Saved Item, w/ 20ms DELAY', function(done) {
  	// wait after a timeout -- we don't use write sync
		getConnection(function(err, db) {
	  	setTimeout(function() {
				cache.getItem(idKey, function(err, result) {
					// console.log('GET', arguments)
					assert.equal(null, err)
					assert.equal(result.foo, 'bar')
					done()
				})
			}, 250)
	  });
	})

 //  it('Delete Saved Item', function(done) {
	// 	getConnection(function(err, db) {
	//   	setTimeout(function() {
	// 			cache.setItem(idKey, null, function(err, count) {
	// 				// console.log('REMOVE', arguments)
	// 				assert.equal(null, err)
	// 				// assert.ok(!count || count === 1 || count && count.ok ) // handle response if { w: 0 } or 1
	// 				done()
	// 			})
	// 		}, 350);
	// 	});
	// })

})
