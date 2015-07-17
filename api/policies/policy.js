
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Articles Permissions
 */
exports.invokeRolesPolicies = function() {
	acl.allow([{
		roles: ['admin'],
		allows: [{
			resources: '/api/jobs',
			permissions: '*'
		}, {
			resources: '/api/jobs/:jobId',
			permissions: '*'
		}]
	},{
		roles: ['user'],
		allows: [{
			resources: '/api/jobs',
			permissions: ['get']
		}, {
			resources: '/api/jobs/:jobId',
			permissions: ['get']
		}]
	}]);
};

/**
 * Check If Articles Policy Allows
 */
exports.isAllowed = function(req, res, next) {
	var roles = (req.user) ? req.user.roles : ['user'];
	return next();
};
