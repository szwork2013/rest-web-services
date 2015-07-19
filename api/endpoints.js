var EndpointManager = require('restify-endpoints').EndpointManager;
var path = require('path');
// Instantiate the Restify Endpoint Manager
var manager = new EndpointManager({
  endpointpath: __dirname + '/endpoints'
});

module.exports.manager = manager;
