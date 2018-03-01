const { Skyra, config } = module.exports = require('./index');
const { FLAGS } = require('discord.js').Permissions;

Skyra.defaultPermissionLevels
	.add(4, (client, msg) => Boolean(msg.member) && (msg.guild.configs.roles.staff
		? msg.member.roles.has(msg.guild.configs.roles.staff)
		: msg.member.permissions.has(FLAGS.MANAGE_MESSAGES)), { fetch: true })
	.add(5, (client, msg) => Boolean(msg.member) && (msg.guild.configs.roles.moderator
		? msg.member.roles.has(msg.guild.configs.roles.moderator)
		: msg.member.permissions.has(FLAGS.BAN_MEMBERS)), { fetch: true })
	.add(6, (client, msg) => Boolean(msg.member) && (msg.guild.configs.roles.admin
		? msg.member.roles.has(msg.guild.configs.roles.admin)
		: msg.member.permissions.has(FLAGS.MANAGE_GUILD)), { fetch: true });

const client = new Skyra({
	cmdEditing: true,
	cmdLogging: false,
	cmdPrompt: true,
	console: config.console,
	gateways: {
		clientStorage: { provider: 'json', nice: false },
		guilds: { provider: 'rethinkdb' },
		users: { provider: 'rethinkdb' }
	},
	ownerID: '242043489611808769',
	pieceDefaults: {
		commands: { deletable: true },
		monitors: { ignoreOthers: false },
		ipcPieces: { enabled: true },
		rawEvents: { enabled: true }
	},
	consoleEvents: {
		verbose: true
	},
	disabledEvents: [
		'CHANNEL_PINS_UPDATE',
		'GUILD_MEMBER_REMOVE',
		'RELATIONSHIP_ADD',
		'RELATIONSHIP_REMOVE',
		'TYPING_START',
		'USER_NOTE_UPDATE'
	],
	prefix: 's!',
	// Uncheck for release
	// regexPrefix: /^^(hey )?(eva|skyra)(,|!)/i,
	regexPrefix: /^(hey )?eva(,|!)/i,
	providers: {
		default: 'rethinkdb',
		rethinkdb: config.database.rethinkdb,
		postgresql: config.database.postgresql
	},
	quotedStringSupport: true,
	readyMessage: (_client) =>
		`Skyra ${config.version} ready! [${_client.user.tag}] [ ${_client.guilds.size} [G]] [ ${_client.guilds.reduce((a, b) => a + b.memberCount, 0).toLocaleString()} [U]].`,
	typing: false
});

client.login(config.tokens.bot.dev).catch((error) =>
	client.console.log(`Login Error:\n${(error && error.stack) || error}`, 'wtf'));
