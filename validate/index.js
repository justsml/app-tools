(function() {
	'use strict';
	module.exports = function Validate(data, rules, callback) {
		var errors = [];
		Array.prototype.forEach.call(Object.keys(rules), function(key) {
			if ( !data[key] || !rules[key].test(data[key]) ) {
				errors.push(key + " is Invalid");
			}
		})
		errors = errors.length > 0 ? errors : true
		if (!callback) {
			return errors;
		} else {
			if ( callback ) { callback(errors) }
		}
	}
})()
