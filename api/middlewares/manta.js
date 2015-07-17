var _ = require("lodash"),
path = require('path'),
config = require(path.resolve('./config/config')),
fs = require('fs'),
assert = require('assert'),
redis = require("redis")
uuid = require('uuid-v4'),
jsonwebtoken = require("jsonwebtoken"),
UnauthorizedAccessError = require('../../lib/errors/tokenErrors'),
manta = require('manta');


var storageClient = manta.createClient({
    sign: manta.privateKeySigner({
        key: fs.readFileSync('/Users/samaweb/.ssh/id_rsa', 'utf8'),
        keyId: "61:5e:4a:a2:df:17:c2:44:f2:4c:99:90:43:5b:4e:be",
        user: "websama"
    }),
    user: "websama",
    url: "https://us-east.manta.joyent.com"
}); 

module.exports = storageClient;
    
