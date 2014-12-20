var assert = require('better-assert'),
		validate = new require('../'),
		rules = {
			"userId": /\w{2,20}/,
			"password": /^[^\s]{2,16}$/	},
		goodData = { 
			'userId': 'EricCartman', 
			'password': '#ihatecartmanbra'
		},
		badData = { 
			'userId': '#$@#', 
			'password': '#'
		}

describe('validate()', function() {
	it('can validate', function (done) {
		var results = validate(goodData, rules);
		assert(results === true)
		done()
	})
	it('returns valid error response', function (done) {
		var results = validate(badData, rules);
		assert(results.length === 2)
		done()
	})

})
