const { Skyra, config } = module.exports = require('./index');

new Skyra({
	cmdEditing: true,
	cmdLogging: false,
	cmdPrompt: true,
	console: { useColor: true },
	gateways: {
		clientStorage: { provider: 'json', nice: false },
		guilds: { provider: 'rethinkdb' },
		users: { provider: 'postgresql' }
	},
	ownerID: '242043489611808769',
	pieceDefaults: { commands: { deletable: true } },
	prefix: 's!',
	// Uncheck for release
	// regexPrefix: /^(hey )?skyra(,|!)/i,
	providers: {
		default: 'json',
		rethinkdb: config.database.rethinkdb,
		postgresql: config.database.postgresql
	},
	quotedStringSupport: true,
	readyMessage: (client) =>
		`Skyra ${config.version} ready! [${client.user.tag}] [ ${client.guilds.size} [G]] [ ${client.guilds.reduce((a, b) => a + b.memberCount, 0).toLocaleString()} [U]].`,
	typing: false
}).login(config.tokens.bot.dev);
