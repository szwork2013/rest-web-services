var _ = require("lodash"),
path = require('path'),
config = require(path.resolve('./config/config')),
fs = require('fs'),
assert = require('assert'),
mongoose = require('mongoose'),
redis = require("redis")
uuid = require('uuid-v4'),
jsonwebtoken = require("jsonwebtoken"),
errorHandler = require('../../lib/errors/dbError.js'),
UnauthorizedAccessError = require('../../lib/errors/tokenErrors'),
mailerService = require('../../lib/mailerService.js'),
storageClient = require('../middlewares/manta'),
token = require('../middlewares/token'),
User = require('../models/user');

function signup(req, res, next) {
  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;
  
  // Init Variables
  var user = new User(req.body);
  var message = null;

  // Add missing user fields
  user.provider = 'local';
  user.displayName = user.firstName + ' ' + user.lastName;
  user.activationKey = uuid();
  
  if (req.body.compte === 'premium') {
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
        if (err) {
          console.log(err)
        } else{
          console.log("User created and mail sending to"+user.email );
          res.json({ status: true , message: "User created and mail sending to"+user.email })
          return next();
        };
      });
    }
  });
}

function signin (req, res , next) {

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

function active(req,res ,next) {
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
              res.json({ status: true , message: "User usedActivationKey active" })
              return next();
            });
          }
        });
      }
    });
  };
}

function signout(req, res,next) {
  var message = null;
  if (token.expire(req.headers)) {
    delete req.user;
    res.json({ status: true , message: "User has been successfully logged out"
    });
  } else {
    return next(new UnauthorizedAccessError("401"));
  }
}



module.exports = {
  name: 'Auth',
  description: 'auth Endpoints',
  endpoints: [
    {
      name: 'signup',
      description: 'signup Endpoint',
      method: 'POST',
      //auth: true,
      path: '/api/auth/signup',
      version: '1.0.0',
      //middleware: token.middleware,
      fn: signup 
    },
    {
      name: 'active',
      description: 'active',
      method: 'POST',
      //auth: true,
      //middleware: auth,
      path: '/api/auth/verify',
      version: '1.0.0',
      fn: active
    },
    {
      name: 'signin',
      description: 'signin',
      method: 'POST',
      //auth: true,
      //middleware: auth,
      path: '/api/auth/signin',
      version: '1.0.0',
      fn: signin
    },
    {
      name: 'signout',
      description: 'signout',
      method: 'POST',
      //auth: true,
      //middleware: auth,
      path: '/api/auth/signout',
      version: '1.0.0',
      fn: signout
    }
  ]
}
