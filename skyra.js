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
	consoleEvents: { verbose: true },
	clock: { interval: 5000 },
	disabledEvents: [
		'CHANNEL_PINS_UPDATE',
		'GUILD_MEMBER_REMOVE',
		'PRESENCE_UPDATE',
		'RELATIONSHIP_ADD',
		'RELATIONSHIP_REMOVE',
		'TYPING_START',
		'USER_NOTE_UPDATE',
		'VOICE_SERVER_UPDATE'
	],
	gateways: { clientStorage: { provider: 'json' } },
	messageCacheLifetime: 300,
	messageCacheMaxSize: 50,
	messageSweepInterval: 120,
	ownerID: '242043489611808769',
	pieceDefaults: {
		commands: { deletable: true },
		ipcPieces: { enabled: true },
		monitors: { ignoreOthers: false },
		rawEvents: { enabled: true }
	},
	prefix: 's!',
	providers: {
		default: 'rethinkdb',
		rethinkdb: config.database.rethinkdb
	},
	quotedStringSupport: true,
	readyMessage: (_client) =>
		`Skyra ${config.version} ready! [${_client.user.tag}] [ ${_client.guilds.size} [G]] [ ${_client.guilds.reduce((a, b) => a + b.memberCount, 0).toLocaleString()} [U]].`,
	// regexPrefix: /^(hey )?(eva|skyra)(,|!)/i,
	// Uncheck for release
	regexPrefix: /^(hey )?eva(,|!)/i,
	typing: false
});

client.login(config.tokens.bot.dev).catch((error) =>
	client.console.wtf(`Login Error:\n${(error && error.stack) || error}`));
