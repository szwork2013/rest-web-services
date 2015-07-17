"use strict";

var config = require('../config/config'),
	path = require('path'),
	util = require('util'),
	fs = require('fs'),
	manta = require('manta'),
    assert = require('assert'),
	mongoose = require('mongoose');

// Load  models
module.exports.loadModels = function() {
	
	config.files.models.forEach(function(modelPath) {
		require(path.resolve(modelPath));
	});
};


// Initialize Mongodb connection
module.exports.connect = function(cb) {
	var _this = this;
	
	mongoose.set('debug', true);
	
	mongoose.connect(config.mongodbURI, function (err) {
		if (err) {
			//debug('Mongoose connection error');
			console.log(err);
		} else {
			//debug("Mongoose connected to the database");
			// Load modules
			_this.loadModels();
			if (cb) cb();
		}
	});
};

module.exports.disconnect = function(cb) {
  mongoose.disconnect(function(err) {
  	debug('Disconnected from MongoDB.');
  	cb(err);
  });
};
