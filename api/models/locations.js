/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Article Schema
 */
var  LocationsSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    default: '',
    trim: true,
    required: 'Title cannot be blank'
  },
  loc: {longitude: Number, latitude:Number},
  description: {
    type: String,
    default: '',
    trim: true,
    required: 'Title cannot be blank'
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  ville: {
    type: String,
    default: '',
    required: 'Title cannot be blank'
  },
  zip: {
    type: String,
    default: '',
    required: 'Title cannot be blank'
  },
  address: {
    type: String,
    default: '',
    required: 'Title cannot be blank'
  },
  price: {
    type: Number,
    default: '',
    required: 'Title cannot be blank'
  },
  type: {
    type: String,
    required: 'Title cannot be blank'
  },
  status: {
    type: String,
    default: '',
    required: 'Title cannot be blank'
  },
  area: {
    type: Number,
    required: 'Title cannot be blank'
  },
  images: [],
  imagetypes:{
    type: String
  },
  agency: {
    type: String
  },
  rating: {
    type: String
  }
});
LocationsSchema.index({loc: '2d'});
var Locations = mongoose.model('Locations',  LocationsSchema);
module.exports = Locations;