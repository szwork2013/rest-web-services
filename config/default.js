'use strict';

module.exports = {
	auth: {
	
	    redis: {
	      host: '37.153.97.141',
	      port: 6379,
	      seed: {}
	    }
  	},
    neo4jURI:'http://72.2.115.46:7474',
    mongodbURI:"mongodb://samaweb:samaweb@ds061188.mongolab.com:61188/samaweb",
	passphrase:'ye8Ab0B6Qgl6oI0WRZj4LlFlxK45Pg2XFJ3kJrpX4TRJ7A1K7P',
	app: {
		title: 'Restify-JwT',
		email: 'support@pharmacool.fr'
	},
	mailer: {
		auth: {
			api_key: "key-edee55b0785b8b3b9711d0a395edbe72",
			domain: "sandboxbf00cd48fe37420997b505444ff9c289.mailgun.org"
		}
	},
	opts:{
        headers: {
            'access-control-allow-headers': 'access-control-allow-origin, accept, origin, content-type',
            'access-control-allow-methods': 'PUT,GET,HEAD,DELETE',
            'access-control-allow-origin': '*'
        }
    },
    secret: "Ci23fWtahDYE3dfirAHrJhzrUEoslIxqwcDN9VNhRJCWf8Tyc1F1mqYrjGYF",
    allJS: [],
    sockets: './api/sockets/**/*.js',
	models: ['./models/*.js'],
	policies: ['./api/policies/*.js'],
	CORS_OPTIONS: {
    	headers: {
            'access-control-allow-headers': 'access-control-allow-origin, accept, origin, content-type',
            'access-control-allow-methods': 'PUT,GET,HEAD,DELETE',
            'access-control-allow-origin': '*'
    	}
	},
	DROPBOX: '/websama/stor/samaweb'
};
