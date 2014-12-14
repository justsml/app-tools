"use strict";

var Cache = require('../')
// var cache = new Cache(null, 'cache')
var cache = new Cache()
var assert = require('assert');

cache.setItem('bar', {foo: 'bar'}, function(err, count) {
	// console.log('setItem', arguments)
	assert.equal(null, err)
	assert.equal(count, 1)

	setTimeout(function() {
		cache.getItem('bar', function(err, result) {
			console.log('getItem', arguments)
			assert.equal(null, err)
			assert.equal(result.foo, 'bar')
		})
	}, 1000)
})

// 	cache.setItem('foo', null, function(err, result) {
// 		assert.equal(null, err)
// 		// throw new Error(result)
// 		// assert.equal(result.foo, 'bar')
// 	})

