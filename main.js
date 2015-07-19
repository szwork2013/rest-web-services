
var config = require('./config/config'),
	db = require('./lib/db'),
    assert = require('assert'),
    fs = require('fs'),
    manta = require('manta'),
	restify = require('./lib/restify'),
    storageClient = require('./api/middlewares/manta');

// Mainline

db.connect(function () {

    storageClient.mkdirp(config.DROPBOX, config.CORS_OPTIONS, function (err) {
        assert.ifError(err); 
        
        var server = restify.init();
        
        server.listen(443 ,"37.153.108.27",function () {
            console.log('%s listening at %s', server.name, server.url);
        });
    });
});