var config = require('./config/config'),
	db = require('./lib/db'),
    assert = require('assert'),
    fs = require('fs'),
    manta = require('manta'),
	restify = require('./lib/restify'),
    storageClient = require('./lib/manta');

db.connect(function() {

    storageClient.mkdirp(config.DROPBOX, config.CORS_OPTIONS, function (err) {
        assert.ifError(err); 
        
        var server = restify.init();
        
        server.listen(443 ,function () {
            console.log('server listen to port 443' );
        });
    });
});