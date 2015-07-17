'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	crypto = require('crypto');

var validateLocalStrategyProperty = function(property) {
	return ((this.provider !== 'local' && !this.updated) || property.length);
};

var validateLocalStrategyPassword = function(password) {
	return (this.provider !== 'local' || (password && password.length > 6));
};

// these values can be whatever you want - we're defaulting to a
// max of 5 attempts, resulting in a 2 hour lock

var MAX_LOGIN_ATTEMPTS = 5;
var LOCK_TIME = 5 * 60 * 1000;

/**
 * User Schema
 */
var UserSchema = new Schema({
	firstName: {
		type: String,
		trim: true,
		default: '',
		validate: [validateLocalStrategyProperty, 'Please fill in your first name']
	},
	lastName: {
		type: String,
		trim: true,
		default: '',
		validate: [validateLocalStrategyProperty, 'Please fill in your last name']
	},
	displayName: {
		type: String,
		trim: true
	},
	phone: {
		type: String,
		required: 'Please fill in a phone',
	},
	mobile: {
		type: String,
		required: 'Please fill in a mobile',
	},
	email: {
		type: String,
		unique: 'email existe deja',
		trim: true,
		default: '',
		validate: [validateLocalStrategyProperty, "S'il vous plaît remplire  votre e-mail"],
		match: [/.+\@.+\..+/, "S'il vous plaît remplire une adresse email valide"]
	},
	username: {
		type: String,
		//unique: 'testing error message',
		//required: 'Please fill in a username',
		trim: true
	},
    online: Boolean,
    ville: {
		type: String,
		required: 'Title cannot be blank'
	},
	job: {
		type: String,
		default: '',
		required: 'Please fill in a job',
	},
	notifications : [{
	    message : { type: String,default: ""},
	    date : { type : Date, default: Date.now() },
	    read : { type: Boolean, default : false },
	    senderId : String
	}],
	password: {
		type: String,
		default: '',
		validate: [validateLocalStrategyPassword, 'Password should be longer']
	},
	salt: {
		type: String
	},
	profileImageURL: {
		type: String,
		default: 'https://us-east.manta.joyent.com/websama/public/avatar/avatar.png'
	},
	provider: {
		type: String
		//required: 'Provider is required'
	},
	providerData: {},
	additionalProvidersData: {},
	roles: {
		type: [{
			type: String,
			enum: ['user', 'admin']
		}],
		default: ['user']
	},
	updated: {
		type: Date
	},
	created: {
		type: Date,
		default: Date.now
	},
	activationKey:{
		type: String,
		default: ""
	},
	active:{ 
		type: Boolean,
  		default: false
  	},
	activationKeyUsed: { 
	  	type: Boolean, 
	  	default: false 
	},
	loginAttempts: { type: Number, required: true, default: 0 },
    lockUntil: { type: Number }
});

UserSchema.virtual('isLocked').get(function() {
    // check for a future lockUntil timestamp
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function(next) {
	var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password') && !user.isModified('salt')) return next();

	if (this.password && this.password.length > 6) {
		this.salt = crypto.randomBytes(16).toString('base64');
		this.password = this.hashPassword(this.password);
	}

	next();
});

UserSchema.statics.failedLogin = {
    NOT_FOUND: 0,
    PASSWORD_INCORRECT: 1,
    MAX_ATTEMPTS: 2
};


/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function(password) {
	if (this.salt && password) {
		return crypto.pbkdf2Sync(password, new Buffer(this.salt, 'base64'), 10000, 64).toString('base64');
	} else {
		return password;
	}
};

/* overwrite the toJSON method to exclude some of the sensitive fields
UserSchema.methods.toJSON = function() {
  var obj = this.toObject();
  obj.hasPassword = obj.password ? true: false;
  delete obj.password;
  delete obj.salt;
  delete obj.loginAttempts;
  return obj;
}
*/
/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function(password) {
	return this.password === this.hashPassword(password);
};

mongoose.model('User', UserSchema);
