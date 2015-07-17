var _ = require("lodash"),
path = require('path'),
config = require(path.resolve('./config/config')),
fs = require('fs'),
assert = require('assert'),
mongoose = require('mongoose'),
redis = require("redis")
uuid = require('uuid-v4'),
jsonwebtoken = require("jsonwebtoken"),
errorHandler = require('../../lib/errors/authError'),
UnauthorizedAccessError = require('../../lib/errors/tokenErrors'),
mailerService = require('../../lib/mailerService.js'),
storageClient = require('../middlewares/manta'),
token = require('../middlewares/token'),
User = require('../models/user');


module.exports.signup = function(req, res, next) {
	// For security measurement we remove the roles from the req.body object
	delete req.body.roles;
	
	// Init Variables
	var user = new User(req.body);
	var message = null;

	// Add missing user fields
	user.provider = 'local';
	user.displayName = user.firstName + ' ' + user.lastName;
    user.activationKey = uuid();

    if (req.body.job === 'phT') {
        user.roles = ['admin']
    } else{
        user.roles = ['user']
    };
	// Then save the user 
	user.save(function(err) {
		if (err) {
            return res.send(400, { message: errorHandler.getErrorMessage(err) } );
		} else {
			
            var mail = {
                email: user.email,
                displayName: user.displayName ,
                appName: 'samaweb',
                activationLink: 'http://' + req.headers.host + '/api/auth/verify/' +
                user.activationKey
            };
            mailerService.sendMail(mail, function(err, response) {
                console.log(err)
                console.log(response)
                if (!err) {
                    console.log("User created and mail sending to"+user.email );
                    next();
                };
            });
		}
	});
}

module.exports.signin = function(req, res , next) {

	var email = req.body.email,
    password = req.body.password;

    if (_.isEmpty(email) || _.isEmpty(password)) {
        return next(new UnauthorizedAccessError("401", {
            message: 'Invalid email or password'
        }));
    }

    process.nextTick(function () {

        User.findOne({
            email: email
        }, function (err, user) {

            if (err || !user) {
                return next(new UnauthorizedAccessError("401", {
                    message: 'Invalid username or password'
                }));
            }

            if (!user.authenticate(password)) {
                return next(new UnauthorizedAccessError("401", {
                    message: 'Invalid password'
                }));
            } 
            else{
                token.create(user, req, res, next);
            };
        });
    });
}

module.exports.active = function(req,res ,next) {

    // Now we create a per-session upload directory, so users can
    // upload without stomping each other. Only once we have their
    // dropbox setup do we return 200 and the HTML
    var activationKey = req.body.uuid ;
    if (!uuid.isUUID(activationKey)) {
        console.log('err')
    } else{
        var dir = config.DROPBOX + '/' + activationKey  ;
        storageClient.mkdir(dir, config.CORS_OPTIONS, function (err) {
            if (err) {
                res._error(500, err);
            } else {
                User.find({activationKey: activationKey }, function(err, user){
                    user = user[0]
                    if (err || !user) {
                       console.log('err') 
                    }else if (user.activationKeyUsed) {
                        console.log('usedActivationKey') 
                    }
                    else {
                        user.active = true ;
                        user.activationKeyUsed = true ;
                        //user.accountDeactivated = false ;

                        user.save(function(err) {
                            if(err) {
                                console.log('failedToSave')
                            }
                            console.log("User usedActivationKey active");
                            next()
                        });
                    }
                });
            }
        });
    };
};

/**
 * Signout
 */
module.exports.signout = function(req, res,next) {
    if (token.expire(req.headers)) {
        delete req.user;
            delete req.user;
        res.json({
            "message": "User has been successfully logged out"
        });
    } else {
        return next(new UnauthorizedAccessError("401"));
    }
}

/**
 * Update profile picture
 */
module.exports.changeProfilePicture = function(req, res) {
    console.log(req.user.user.activationKey)
    var params = req.body || {};

    var opts = {
        algorithm: 'RSA-SHA256',
        expires: new Date().getTime() + LIVE_TIME,
        host: 'manta.us-east.joyentcloud.com',
        keyId: process.env.MANTA_KEY_ID,
        path: config.DROPBOX + '/' + req.user.user.activationKey  + '/' + params.file,
        sign: manta.privateKeySigner({
            key: fs.readFileSync(process.env.HOME + '/.ssh/id_rsa', 'utf8'),
            keyId: process.env.MANTA_KEY_ID,
            user: process.env.MANTA_USER
        }),
        user: process.env.MANTA_USER,
        method: ['OPTIONS', 'PUT'],
    };
    storageClient.signURL(opts, function (err, signature) {

            if (err) {
                res.error(500, err);
                return;
            }
            var signed = JSON.stringify({
                url: process.env.MANTA_URL + signature
            });

            User.findOne({_id: req.user._id }, function(err, user){
                if (err || !user) {
                    console.log('err') 
                }
                else {
                    user.profileImageURL = process.env.MANTA_URL + signature ;
                    user.save(function(err) {
                        if(err) {
                            console.log('failedToSave')
                        }
                        res.setHeader('content-type', 'application/json');
                        res.setHeader('content-length', Buffer.byteLength(signed));
                        res.writeHead(200);
                        res.end(signed);
                        
                    });
                }
            });
    });
}

/**
 * Change Password
 */
module.exports.changePassword = function(req, res, next) {
    // Init Variables
    var passwordDetails = req.body;
    console.log(req.user)
    var message = null;

    if (passwordDetails.newPassword) {
        User.findById(req.user._id, function(err, user) {
            if (!err && user) {
                if (user.authenticate(passwordDetails.currentPassword)) {
                    if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
                        user.password = passwordDetails.newPassword;

                        user.save(function(err) {
                            if (err) {
                                return res.send(400);
                            } else {
                                res.send({
                                    message: 'Password changed successfully'
                                });
                            }
                        });
                    } else {
                        res.send({
                            message: 'Passwords do not match'
                        });
                    }
                } else {
                    res.send({
                        message: 'Current password is incorrect'
                    });
                }
            } else {
                res.send({
                    message: 'User is not found'
                });
            }
        });
    } else {
        res.send(400,{
            message: 'Please provide a new password'
        });
    }
};

module.exports.updateProfile = function(req, res) {
    // For security measurement we remove the roles from the req.body object
    delete req.body.roles;

    // Init Variables
    var userInit = req.user.user;
    console.log(req.body)
    User.findById(req.user._id, function(err, user) {
        if (!err && user) {
            
            // Merge existing user
            user = _.extend(user, req.body);
            user.updated = Date.now();
            user.displayName = user.firstName + ' ' + user.lastName;

            user.save(function (err) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.json(user);
                }
            });

        }
    });
}

/**
 * Send User
 */
module.exports.me = function(req, res) {
    res.json(req.user || null);
}

