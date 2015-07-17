"use strict";
/**
 * Module dependencies.
*/

var _ = require("lodash"),
config = require('../config/config'),
path = require('path'),
fs = require('fs'), 
restify = require('restify'),
jwt = require('restify-jwt'),
socketio = require('socket.io'),  
socketio_jwt = require('socketio-jwt'),
redis = require('redis'),
endpoints = require('./endpoints.js'),
tokens = require('../api/middlewares/token');

var client = redis.createClient('6379','37.153.97.141');
client.auth('shni4Grivub!');

/**
 * Init app middleware
 */
module.exports.initMiddleware = function (server) {
	// Log all requests here (this includes latency)
	server.on('after', function(req, res, route, error) {
	  var latency = res.get('Response-Time');
	  if (typeof (latency) !== 'number')
	    latency = Date.now() - req._time;

	  console.log('info', 'REQUEST -', {method: req.method, url: req.url, code: res.statusCode, latency: latency, remote: req.connection.remoteAddress});
	  console.log('debug', 'REQUEST HEADERS - ', req.headers);
	});


	server.use(restify.authorizationParser());
	server.use(restify.acceptParser(server.acceptable));
	server.use(restify.queryParser());
	server.use(restify.bodyParser());
	server.use(restify.jsonp());
	server.use(restify.CORS());
	restify.CORS.ALLOW_HEADERS.push('authorization');
	restify.CORS.ALLOW_HEADERS.push('Access-Control-Allow-Origin');
	server.use(restify.conditionalRequest());
};


module.exports.initMiddlewareToken = function (server) {

	server.use(jwt({ secret: config.secret}).unless({ 
		path:[
			'/api/jobs',
			"/api/search",
			'/api/auth/signup',
			'/api/auth/verify',
			'/api/auth/signin'
		]
	}));
};	

/**
 * Configure the modules ACL policies
 */
module.exports.initPolicies = function (server) {
	// Globbing policy files
	config.files.policies.forEach(function (policyPath) {
		require(path.resolve(policyPath)).invokeRolesPolicies();
	});
};


/**
 * Configure initEndpoints
 */
module.exports.initEndpoints = function (server) {
	// Attach Restify Endpoints to Restify Server
	endpoints.manager.attach(server);	
};

/**
 * Configure error handling
 */
module.exports.initErrorRoutes = function (server) {
	server.on('uncaughtException',function(request, response, route, error){
  		console.error(error.stack);
  		response.send(error);
	});
	
	/* Restify servers emit all the events from the node http.Server and 
	has several other events you want to listen on.
	
	server.on('NotFound', function (request, response, cb) {});              // When a client request is sent for a URL that does not exist, restify will emit this event. Note that restify checks for listeners on this event, and if there are none, responds with a default 404 handler. It is expected that if you listen for this event, you respond to the client.
	server.on('MethodNotAllowed', function (request, response, cb) {});      // When a client request is sent for a URL that does exist, but you have not registered a route for that HTTP verb, restify will emit this event. Note that restify checks for listeners on this event, and if there are none, responds with a default 405 handler. It is expected that if you listen for this event, you respond to the client.
	server.on('VersionNotAllowed', function (request, response, cb) {});     // When a client request is sent for a route that exists, but does not match the version(s) on those routes, restify will emit this event. Note that restify checks for listeners on this event, and if there are none, responds with a default 400 handler. It is expected that if you listen for this event, you respond to the client.
	server.on('UnsupportedMediaType', function (request, response, cb) {});  // When a client request is sent for a route that exist, but has a content-type mismatch, restify will emit this event. Note that restify checks for listeners on this event, and if there are none, responds with a default 415 handler. It is expected that if you listen for this event, you respond to the client.
	server.on('after', function (request, response, route, error) {});       // Emitted after a route has finished all the handlers you registered. You can use this to write audit logs, etc. The route parameter will be the Route object that ran.
	*/
};
/**
 * Configure Socket.io
 */
module.exports.initSocketIO = function (server) {
	
	var io = socketio.listen(server);

	// Intercept Socket.io's handshake request
  	io.use(socketio_jwt.authorize({
   	 secret: config.secret,
   	 handshake: true
  	}));

  	io.sockets.on('connection', function (socket) {
    	socket.emit('news', { hello: 'world' });
    	// Load the Socket.io configuration
	//require('./socket.io')(server);
	});

};

/**
 * Init Express app
 */
module.exports.init = function () {

	// Setup some https server options
	var https_options = {
		name: ' https webservice',
  		key: fs.readFileSync('./config/sslcerts/key.pem'),

  		certificate: fs.readFileSync('./config/sslcerts/cert.pem'),
  		httpsServerOptions: {
  			passphrase: 'katkout1983'
  		}
	};

	//var server = restify.createServer();
	var server = restify.createServer(https_options);

	// Initialize Express middleware
	this.initMiddleware(server);

	// Initialize JWT middleware
	//this.initMiddlewareToken(server);

	// Initialize authorization policies
	//this.initPolicies(server);

	// Initialize routes
	this.initEndpoints(server);

	// Initialize error routes
	this.initErrorRoutes(server);

	// Configure Socket.io
	//this.initSocketIO(server);

	return server;
};
