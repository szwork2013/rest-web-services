var _ = require("lodash"),
restify = require('restify'),
path = require('path'),
mongoose = require('mongoose'),
token = require('../middlewares/token'),
errorHandler = require('../../lib/errors/dbError.js'),
UnauthorizedAccessError = require('../../lib/errors/tokenErrors'),
Locations = require('../models/locations');


var geocoderProvider = 'google',
httpAdapter = 'https',
extra = {
    apiKey: 'AIzaSyDrBJKLCYEhgETpcjRoNtoTOM34oj_aTWI', // for Mapquest, OpenCage, Google Premier
    formatter: null         // 'gpx', 'string', ...
};     
   
function getAllLocations (req, res, next) {
  Locations.find({},function (err, locations) {
    if (err) {
      console.log(err);
    } else{
      res.json(locations);
    };
  });
}

function getOneLocations(req, res, next) {
  Locations.findOne({ _id: req.params.id }, function (err, data) {
    console.log(req.params)
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8'
    });
    res.end(JSON.stringify(data));
  });
}

function saveLocation (req, res, next) {
  var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra);
  geocoder.geocode(req.body.address , function(err, data) {
    var location = new Locations(req.body);

    location.loc =  {
      longitude: data[0].longitude,
      latitude: data[0].latitude
    };
    location.images = "https://us-east.manta.joyent.com/websama/public/icon-prop/property-01.jpg";
    if (req.body.type === 'appartment') {
      location.imagetypes = "https://us-east.manta.joyent.com/websama/public/icon-prop/apartment.png"
    } else{
      location.imagetypes = "https://us-east.manta.joyent.com/websama/public/icon-prop/cottage.png"
    };
            
    location.save(function(err) {
      if (err) {
        console.log(err)
      } else {
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8'
        });
        res.end(JSON.stringify(location));
      }
    });
  });
}

function updatedLocations(req, res, next) {
  Locations.findOne({ _id: req.params.id }, function (err, location) {
    // merge req.params/product with the server/product
    
    if (!err && location) {
      // Merge existing user
      location = _.extend(location, req.body);
      location.updated = Date.now();

      location.save(function (err) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.json(location);
        }
      });
    }
  });
}    

function deletLocations(req, res, next) {
  Locations.remove({ _id: req.params.id }, function (err, data) {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8'
    });
    res.end(JSON.stringify(true));
  });
  //return next();
}


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
      fn: saveLocation
    },
    {
      name: 'getAlllocations',
      description: 'getAlllocations',
      method: 'GET',
      //auth: true,
      //middleware: auth,
      path: '/api/locations',
      version: '1.0.0',
      fn: getAllLocations
    },
    {
      name: 'getOnelocations',
      description: 'getOnelocations',
      method: 'GET',
      //auth: true,
      //middleware: auth,
      path: '/api/locations/:id',
      version: '1.0.0',
      fn: getOneLocations 
    },
    {
      name: 'updatelocations',
      description: 'updatelocations',
      method: 'PUT',
      //auth: true,
      //middleware: auth,
      path: '/api/locations/:id',
      version: '1.0.0',
      fn: updatedLocations
    },
    {
      name: 'deltlocations',
      description: 'deletlocations',
      method: 'DELETE',
      //auth: true,
      //middleware: auth,
      path: '/api/locations/:id',
      version: '1.0.0',
      fn: deletLocations
    }
  ]
}