
var _ = require("lodash"),
restify = require('restify'),
path = require('path'),
mongoose = require('mongoose'),
token = require('../middlewares/token'),
errorHandler = require('../../lib/errors/authError'),
UnauthorizedAccessError = require('../../lib/errors/tokenErrors'),
Locations = require('../models/ locations');


var geocoderProvider = 'google',
httpAdapter = 'https',
extra = {
    apiKey: 'AIzaSyDrBJKLCYEhgETpcjRoNtoTOM34oj_aTWI', // for Mapquest, OpenCage, Google Premier
    formatter: null         // 'gpx', 'string', ...
};     
   
module.exports.getAllLocations =  function(req, res, next) {
    Locations.find({},function (err, jobs) {
        if (err) {
            console.log(err);
        } else{
            res.json(jobs);
        };
    });
};

module.exports.getOneLocations  = function(req, res, next) {
    Locations.findOne({ _id: req.params.id }, function (err, data) {
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8'
        });
        res.end(JSON.stringify(data));
    });
};

module.exports.saveLocation = function(req, res, next) {
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
};

module.exports.updatedLocations = function(req, res, next) {
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
};    

module.exports.deletLocations = function(req, res, next) {
        
    Locations.remove({ _id: req.params.id }, function (err, data) {
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8'
        });
        res.end(JSON.stringify(true));
    });
    //return next();
};  

