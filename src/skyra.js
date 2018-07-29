const { Skyra, config, assetsFolder, Permissions: { FLAGS } } = module.exports = require('./index');

// Canvas setup
const { join } = require('path');
require('canvas-constructor').Canvas
	.registerFont(join(assetsFolder, 'fonts', 'Roboto-Regular.ttf'), 'RobotoRegular')
	.registerFont(join(assetsFolder, 'fonts', 'NotoEmoji.ttf'), 'RobotoRegular')
	.registerFont(join(assetsFolder, 'fonts', 'NotoSans-Regular.ttf'), 'RobotoRegular')
	.registerFont(join(assetsFolder, 'fonts', 'Roboto-Light.ttf'), 'RobotoLight')
	.registerFont(join(assetsFolder, 'fonts', 'Family-Friends.ttf'), 'FamilyFriends');

// eslint-disable-next-line no-process-env
const DEV = process.env.DEV === 'true';

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
	commandEditing: true,
	commandLogging: false,
	cmdPrompt: true,
	console: config.console,
	consoleEvents: { verbose: true },
	dev: DEV,
	disabledEvents: [
		'CHANNEL_PINS_UPDATE',
		'GUILD_MEMBER_UPDATE',
		'PRESENCE_UPDATE',
		'RELATIONSHIP_ADD',
		'RELATIONSHIP_REMOVE',
		'TYPING_START',
		'USER_NOTE_UPDATE',
		'USER_UPDATE',
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
	prefix: DEV ? 'sd!' : 's!',
	presence: { activity: { name: DEV ? 'sd!help' : 'Skyra, help', type: 'LISTENING' } },
	providers: {
		default: 'rethinkdb',
		rethinkdb: config.database.rethinkdb
	},
	quotedStringSupport: true,
	readyMessage: (client) =>
		`Skyra ${config.version} ready! [${client.user.tag}] [ ${client.guilds.size} [G]] [ ${client.guilds.reduce((a, b) => a + b.memberCount, 0).toLocaleString()} [U]].`,
	regexPrefix: DEV ? null : /^(hey )?(eva|skyra)(,|!)/i,
	schedule: { interval: 5000 },
	typing: false
});

skyra.login(DEV ? config.tokens.bot.dev : config.tokens.bot.stable)
	.catch((error) => skyra.console.wtf(`Login Error:\n${(error && error.stack) || error}`));
