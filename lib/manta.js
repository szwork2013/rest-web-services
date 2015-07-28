var _ = require("lodash"),
path = require('path'),
config = require(path.resolve('./config/config')),
fs = require('fs'),
assert = require('assert'),
redis = require("redis")
uuid = require('uuid-v4'),
jsonwebtoken = require("jsonwebtoken"),
manta = require('manta');

var storageClient = manta.createClient({
    sign: manta.privateKeySigner({
        key: fs.readFileSync('./config/id_rsa', 'utf8'),
        keyId: "3a:38:ed:ce:3d:c8:c7:4f:a4:ac:76:2a:4d:71:fb:c1",
        user: "websama"
    }),
    user: "websama",
    url: "https://us-east.manta.joyent.com"
}); 

module.exports = storageClient;
    
