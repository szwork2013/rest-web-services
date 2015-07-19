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
token = require('../../api/middlewares/token'),
User = require('../models/user');


function changeProfilePicture(req, res) {
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

function changePassword(req, res, next) {
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
}

function updateProfile(req, res) {
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

function me(req, res) {
  res.json(req.user || null);
}

module.exports = {
  name: 'Profile',
  description: 'Profile',
  endpoints: [
    {
      name: 'changeProfilePicture',
      description: 'changeProfilePicture Endpoint',
      method: 'POST',
      //auth: true,
      path: '/api/users/picture',
      version: '1.0.0',
      //middleware: token.middleware,
      fn: changeProfilePicture 
    },
    {
      name: 'changePassword',
      description: 'changePassword',
      method: 'POST',
      //auth: true,
      //middleware: auth,
      path: '/api/users/password',
      version: '1.0.0',
      fn: changePassword
    },
    {
      name: 'updateProfile',
      description: 'updateProfile',
      method: 'POST',
      //auth: true,
      //middleware: auth,
      path: '/api/users',
      version: '1.0.0',
      fn: updateProfile
    }
  ]
}