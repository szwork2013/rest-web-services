var _ = require('lodash'),
    path = require('path'),
    glob = require('glob');
    

var getGlobbedPaths = function(globPatterns, excludes) {
    // URL paths regex
    var urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');

    // The output array
    var output = [];

    // If glob pattern is array so we use each pattern in a recursive way, otherwise we use glob
    if (_.isArray(globPatterns)) {
        globPatterns.forEach(function(globPattern) {
            output = _.union(output, getGlobbedPaths(globPattern, excludes));
        });
    } else if (_.isString(globPatterns)) {
        if (urlRegex.test(globPatterns)) {
            output.push(globPatterns);
        } else {
            var files = glob.sync(globPatterns);
            if (excludes) {
                files = files.map(function(file) {
                    if (_.isArray(excludes)) {
                        for (var i in excludes) {
                            file = file.replace(excludes[i], '');
                        }
                    } else {
                        file = file.replace(excludes, '');
                    }
                    return file;
                });
            }
            output = _.union(output, files);
        }
    }

    return output;
};



/**
 * Initialize global configuration files
 */
var initGlobalConfigFiles = function(config) {
    
    config.files = {};

    // models files
    config.files.models = getGlobbedPaths(config.models);
   
    // Setting Globbed socket files
    config.files.sockets = getGlobbedPaths(config.sockets);

    // Setting Globbed socket files
    config.files.policies = getGlobbedPaths(config.policies);
};

/**
 * Initialize global configuration
 */
var initGlobalConfig = function() {
    
    // Get the default config
    var config = require(path.join(process.cwd(), 'config/default'));
  
    // Initialize global globbed files
    initGlobalConfigFiles(config);

    return config;
};

module.exports = initGlobalConfig();
