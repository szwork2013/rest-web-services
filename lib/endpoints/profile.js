var path = require('path'),
token = require('../../api/middlewares/token'),
user = require('../../api/controllers/user'),
config = require(path.resolve('./config/config'));

//var config = require('../config').auth;
//var auth = require('../auth.js')(config.auth).requireAuth;

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
      fn: user.changeProfilePicture 
    },
    {
      name: 'changePassword',
      description: 'changePassword',
      method: 'POST',
      //auth: true,
      //middleware: auth,
      path: '/api/users/password',
      version: '1.0.0',
      fn: user.changePassword
    },
    {
      name: 'updateProfile',
      description: 'updateProfile',
      method: 'POST',
      //auth: true,
      //middleware: auth,
      path: '/api/users',
      version: '1.0.0',
      fn: user.updateProfile
    }
  ]
}