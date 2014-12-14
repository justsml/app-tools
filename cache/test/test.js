"use strict";

var Cache = require('../')
// var cache = new Cache(null, 'cache')
var cache = new Cache()
var assert = require('assert');

describe('Check Cache Features', function() {
  it('Check methods', function(done) {
		if (! cache.setItem) {
			throw new Error('setItem not found')
		}
		if (! cache.getItem) {
			throw new Error('getItem not found')
		}
		done()
	});

  it('Save Item', function(done) {
		cache.setItem('foo', {foo: 'bar'}, function(err, count) {
			// console.log('SET', arguments)
			assert.equal(null, err)
			assert.ok(!count || count === 1) // handle response if { w: 0 } or 1
			done()
		})
	})

  it('Get Saved Item, w/ 20ms DELAY', function(done) {
  	// wait after a timeout -- we don't use write sync
  	setTimeout(function() {
			cache.getItem('foo', function(err, result) {
				// console.log('GET', arguments)
				assert.equal(null, err)
				assert.equal(result.foo, 'bar')
				done()
			})
		}, 20)
	})

  it('Try Get Missing Item', function(done) {
		cache.getItem('sad473nsdgfdndsf', function(err, result) {
			assert.equal(null, err)
			assert.equal(null, result)
			done()
		})
	})

  it('Delete Saved Item', function(done) {
		cache.setItem('foo', null, function(err, count) {
			// console.log('REMOVE', arguments)
			assert.equal(null, err)
			assert.ok(!count || count === 1) // handle response if { w: 0 } or 1
		})
		done()
	})
})

