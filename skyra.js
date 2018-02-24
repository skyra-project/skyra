const { Skyra, config } = module.exports = require('./index');

const client = new Skyra({
	cmdEditing: true,
	cmdLogging: false,
	cmdPrompt: true,
	console: config.console,
	gateways: {
		clientStorage: { provider: 'json', nice: false },
		guilds: { provider: 'rethinkdb' },
		users: { provider: 'postgresql' }
	},
	ownerID: '242043489611808769',
	pieceDefaults: {
		commands: { deletable: true },
		monitors: { ignoreOthers: false }
	},
	prefix: 's!',
	// Uncheck for release
	// regexPrefix: /^(hey )?skyra(,|!)/i,
	regexPrefix: /^(hey )?eva(,|!)/i,
	providers: {
		default: 'json',
		rethinkdb: config.database.rethinkdb,
		postgresql: config.database.postgresql
	},
	quotedStringSupport: true,
	readyMessage: (_client) =>
		`Skyra ${config.version} ready! [${_client.user.tag}] [ ${_client.guilds.size} [G]] [ ${_client.guilds.reduce((a, b) => a + b.memberCount, 0).toLocaleString()} [U]].`,
	typing: false
});

client.login(config.tokens.bot.dev).catch((error) =>
	client.console.log(`Login Error:\n${error && error.stack ? error.stack : error}`, 'wtf'));
