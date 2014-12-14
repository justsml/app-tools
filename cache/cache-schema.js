'use strict';
var mongoose = require('mongoose');

module.exports = function GetCacheModel(db, modelName) {
	var schema = new mongoose.Schema({
		_id: { type: String, required: true },
		data: { type: Object, default: null },
		timestamp: { type: Date, default: Date.now, expires: '1d' }
	});
	schema.index({ timestamp: 1 });
	schema.set('autoIndex', true);

	//add model to db.models
	db.model(modelName, schema)
	return db.model(modelName)
}
