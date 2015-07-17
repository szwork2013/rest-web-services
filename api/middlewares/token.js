var _ = require("lodash"),
path = require('path'),
config = require(path.resolve('./config/config')),
fs = require('fs'),
redis = require("redis")
uuid = require('uuid-v4'),
jsonwebtoken = require("jsonwebtoken"),
UnauthorizedAccessError = require('../../lib/errors/tokenErrors');

var TOKEN_EXPIRATION = 60,
TOKEN_EXPIRATION_SEC = TOKEN_EXPIRATION * 60 ;

var client = redis.createClient('6379','37.153.97.141');
client.auth('shni4Grivub!');

/**
 * Find the authorization headers from the headers in the request
 *
 * @param headers
 * @returns {*}
 */
function fetch(headers) {
    
    if (headers && headers.authorization) {
        var authorization = headers.authorization;
        var part = authorization.split(' ');
        if (part.length === 2) {
            var token = part[1];
            return part[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};

/**
 * Creates a new token for the user that has been logged in
 *
 * @param user
 * @param req
 * @param res
 * @param next
 *
 * @returns {*}
 */

function create(user, req, res, next) {
    
    if (_.isEmpty(user)) {
        return next(new Error('User data cannot be empty.'));
    }

    var data = {
        user: user,
        token: jsonwebtoken.sign({ _id: user._id }, config.secret, {
            expiresInMinutes: TOKEN_EXPIRATION
        })
    };
    
    var decoded = jsonwebtoken.decode(data.token);
    data.token_exp = decoded.exp;
    data.token_iat = decoded.iat;


    client.set(data.token, JSON.stringify(data), function (err, reply) {
        if (err) {
            return next(new Error(err));
        }

        if (reply) {
            client.expire(data.token, TOKEN_EXPIRATION_SEC, function (err, reply) {
                if (err) {
                    return next(new Error("Can not set the expire value for the token key"));
                }
                if (reply) {
			data.user.password = undefined;
                    data.user.salt = undefined;	
                    req.user = data;
                    next(); // we have succeeded
                } else {
                    return next(new Error('Expiration not set on redis'));
                }
            });
        }
        else {
            return next(new Error('Token not set in redis'));
        }
    });

    return data;

};

/**
 * Fetch the token from redis for the given key
 *
 * @param id
 * @param done
 * @returns {*}
 */
function retrieve(id, done) {


    if (_.isNull(id)) {
        return done(new Error("token_invalid"), {
            "message": "Invalid token"
        });
    }

    client.get(id, function (err, reply) {
        if (err) {
            return done(err, {
                "message": err
            });
        }

        if (_.isNull(reply)) {
            return done(new Error("token_invalid"), {
                "message": "Token doesn't exists, are you sure it hasn't expired or been revoked?"
            });
        } else {
            var data = JSON.parse(reply);

            if (_.isEqual(data.token, id)) {
                return done(null, data);
            } else {
                return done(new Error("token_doesnt_exist"), {
                    "message": "Token doesn't exists, login into the system so it can generate new token."
                });
            }

        }

    });

};

/**
 * Verifies that the token supplied in the request is valid, by checking the redis store to see if it's stored there.
 *
 * @param req
 * @param res
 * @param next
 */
function verify(req, res, next) {


    var token = fetch(req.headers);

    jsonwebtoken.verify(token, config.secret, function (err, decode) {
       
        if (err) {
            req.user = undefined;
            return next(new UnauthorizedAccessError("invalid_token"));
        }

        retrieve(token, function (err, data) {

            if (err) {
                req.user = undefined;
                return next(new UnauthorizedAccessError("invalid_token", data));
            }

            req.user = data;
            next();

        });

    });
};

/**
 * Expires the token, so the user can no longer gain access to the system, without logging in again or requesting new token
 *
 * @param headers
 * @returns {boolean}
 */
function expire(headers) {

    var token = fetch(headers);
   
    if (token !== null) {
        client.expire(token, 0);
    }

    return token !== null;

};

/**
 * Middleware for getting the token into the user
 *
 * @param req
 * @param res
 * @param next
 */
var middleware = function middleware(req,res,next) {

    
        var token = fetch(req.headers);

        retrieve(token, function (err, data) {

            if (err) {
                req.user = undefined;
                return next(new UnauthorizedAccessError("invalid_token", data));
            } else {
                req.user = _.merge(req.user, data);
                next();
            }

        });

};

module.exports.TOKEN_EXPIRATION = TOKEN_EXPIRATION;
module.exports.TOKEN_EXPIRATION_SEC = TOKEN_EXPIRATION_SEC;

module.exports.middleware = middleware ;

