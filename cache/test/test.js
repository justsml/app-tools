"use strict";

var Cache = require('../')
// var cache = new Cache(null, 'cache')
var cache = new Cache()
var assert = require('assert');

describe('Check Cache Features', function() {
  it('Check methods', function(done){
		if (! cache.setItem) {
			throw new Error('setItem not found')
		}
		if (! cache.getItem) {
			throw new Error('getItem not found')
		}
		done()
	});

  it('Save Item', function(done){
		cache.setItem('foo', {foo: 'bar'}, function(err, result) {
			assert.equal(null, err)
		})
		done()
	})

  it('Get Saved Item', function(done){
		cache.getItem('foo', function(err, result) {
			assert.equal(null, err)
			assert.equal(result.foo, 'bar')
		})
		done()
	})

  it('Delete Saved Item', function(done){
		cache.setItem('foo', null, function(err, result) {
			assert.equal(null, err)
			// throw new Error(result)
			// assert.equal(result.foo, 'bar')
		})
		done()
	})
})

