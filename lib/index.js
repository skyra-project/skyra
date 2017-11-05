const config = require('../config');

module.exports = {
	console: require('./console'),
	management: require('./management'),
	parsers: require('./parsers'),
	settings: require('./settings'),
	structures: require('./structures'),
	usage: require('./usage'),
	util: require('./util'),
	ytdl: require('./ytdl'),
	Client: require('./Client'),
	config,
	version: config.version
};
