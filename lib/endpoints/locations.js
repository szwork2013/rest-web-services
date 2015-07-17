var path = require('path'),
token = require('../../api/middlewares/token'),
locations = require('../../api/controllers/locations'),
config = require(path.resolve('./config/config'));

//var config = require('../config').auth;
//var auth = require('../auth.js')(config.auth).requireAuth;

module.exports = {
  name: 'Locations',
  description: 'Locations',
  endpoints: [
    {
      name: 'addLocation',
      description: 'add Location',
      method: 'POST',
      //auth: true,
      path: '/api/locations',
      version: '1.0.0',
      //middleware: token.middleware,
      fn: locations.saveLocation
    },
    {
      name: 'getAlllocations',
      description: 'getAlllocations',
      method: 'Get',
      //auth: true,
      //middleware: auth,
      path: '/api/locations',
      version: '1.0.0',
      fn: locations.getAllLocations
    },
    {
      name: 'getOnelocations',
      description: 'getOnelocations',
      method: 'GET',
      //auth: true,
      //middleware: auth,
      path: '/api/locations/:id',
      version: '1.0.0',
      fn: locations.getOneLocations 
    },
    {
      name: 'updatelocations',
      description: 'updatelocations',
      method: 'PUT',
      //auth: true,
      //middleware: auth,
      path: '/api/locations/:id',
      version: '1.0.0',
      fn: locations.updatedLocations
    },
    {
      name: 'deltlocations',
      description: 'deletlocations',
      method: 'DELETE',
      //auth: true,
      //middleware: auth,
      path: '/api/locations/:id',
      version: '1.0.0',
      fn: locations.deletLocations
    }
  ]
}