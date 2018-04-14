const { Skyra, config } = module.exports = require('./index');
const { Permissions: { FLAGS } } = require('discord.js');

// Canvas setup
const { join } = require('path');
require('canvas-constructor').Canvas
	.registerFont(join(__dirname, 'assets', 'fonts', 'Roboto-Regular.ttf'), 'RobotoRegular')
	.registerFont(join(__dirname, 'assets', 'fonts', 'NotoEmoji.ttf'), 'RobotoRegular')
	.registerFont(join(__dirname, 'assets', 'fonts', 'NotoSans-Regular.ttf'), 'RobotoRegular')
	.registerFont(join(__dirname, 'assets', 'fonts', 'Roboto-Light.ttf'), 'RobotoLight');

// Skyra setup
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

const skyra = new Skyra({
	cmdEditing: true,
	cmdLogging: false,
	cmdPrompt: true,
	console: config.console,
	consoleEvents: { verbose: true },
	disabledEvents: [
		'CHANNEL_PINS_UPDATE',
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
	presence: { activity: { name: 'Skyra, help', type: 'LISTENING' } },
	providers: {
		default: 'rethinkdb',
		rethinkdb: config.database.rethinkdb
	},
	quotedStringSupport: true,
	readyMessage: (client) =>
		`Skyra ${config.version} ready! [${client.user.tag}] [ ${client.guilds.size} [G]] [ ${client.guilds.reduce((a, b) => a + b.memberCount, 0).toLocaleString()} [U]].`,
	regexPrefix: /^(hey )?(eva|skyra)(,|!)/i,
	// regexPrefix: /^(hey )?eva(,|!)/i,
	schedule: { interval: 5000 },
	typing: false
});

skyra.login(config.tokens.bot.stable)
	.catch((error) => skyra.console.wtf(`Login Error:\n${(error && error.stack) || error}`));
