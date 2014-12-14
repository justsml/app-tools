"use strict";

var Cache = require('app/cache')
var cache = new Cache(null, 'propertydetailscache')
var assert = require('assert');

describe('Check Cache Instance\'s Interface', function(){
  it('Check methods', function(done){
		if (! cache.setItem) {
			throw new Error('setItem not found')
		}
		if (! cache.getItem) {
			throw new Error('getItem not found')
		}
		done();
	});
});
describe('SET foo', function(){
  it('setItem', function(done){
		cache.setItem('foo', {foo: 'bar'}, function(err, result) {
			assert.equal(null, err)
		})
		done();
	})
})
describe('GET foo', function(){
  it('Check Saved Item', function(done){
		cache.getItem('foo', function(err, result) {
			assert.equal(null, err)
			assert.equal(result.foo, 'bar')
		})
		done()
	})
})
describe('REMOVE foo', function(){
  it('Delete Saved Item', function(done){
		cache.setItem('foo', null, function(err, result) {
			assert.equal(null, err)
			// throw new Error(result)
			assert.equal(result.foo, 'bar')
		})
		done()
	})
})

