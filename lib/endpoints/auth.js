var path = require('path'),
token = require('../../api/middlewares/token'),
user = require('../../api/controllers/user'),
config = require(path.resolve('./config/config'));

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
      fn: user.signup 
    },
    {
      name: 'active',
      description: 'active',
      method: 'POST',
      //auth: true,
      //middleware: auth,
      path: '/api/auth/verify',
      version: '1.0.0',
      fn: user.active
    },
    {
      name: 'signin',
      description: 'signin',
      method: 'POST',
      //auth: true,
      //middleware: auth,
      path: '/api/auth/signin',
      version: '1.0.0',
      fn: user.signin
    },
    {
      name: 'signout',
      description: 'signout',
      method: 'POST',
      //auth: true,
      //middleware: auth,
      path: '/api/auth/signout',
      version: '1.0.0',
      fn: user.signout
    }
  ]
}
