const StopWatch = require('./util/Stopwatch');
const Redis = require('redis-nextra');
const Discord = require('discord.js');
const { loadavg } = require('os');
const path = require('path');

class Skyra extends Discord.Client {

	constructor(config = {}) {
		super(config.clientOptions);

		this.console = new Console({ stdout: process.stdout, stderr: process.stderr, timestamps: true });

		this.config = config;
		this.config.language = config.language || 'en-US';
		this.baseDir = path.join(__dirname, '../');

		/**
		 * The argument resolver
		 * @type {ArgResolver}
		 */
		this.argResolver = new ArgResolver(this);

		/**
		 * The cache where commands are stored
		 * @type {CommandStore}
		 */
		this.commands = new CommandStore(this);

		/**
		 * The cache where inhibitors are stored
		 * @type {InhibitorStore}
		 */
		this.inhibitors = new InhibitorStore(this);

		/**
		 * The cache where finalizers are stored
		 * @type {FinalizerStore}
		 */
		this.finalizers = new FinalizerStore(this);

		/**
		 * The cache where monitors are stored
		 * @type {MonitorStore}
		 */
		this.monitors = new MonitorStore(this);

		/**
		 * The cache where languages are stored
		 * @type {LanguageStore}
		 */
		this.languages = new LanguageStore(this);

		/**
		 * The cache where events are stored
		 * @type {EventStore}
		 */
		this.events = new EventStore(this);

		/**
		 * The cache where extendables are stored
		 * @type {ExtendableStore}
		 */
		this.extendables = new ExtendableStore(this);

		/**
		 * A Store registry
		 * @type {external:Collection}
		 */
		this.pieceStores = new Discord.Collection();

		/**
		 * The cache of command messages and responses to be used for command editing
		 * @type {external:Collection}
		 */
		this.commandMessages = new Discord.Collection();

		/**
		 * The object where the gateways are stored settings
		 * @type {SettingsCache}
		 */
		this.settings = new SettingsCache(this);

		/**
		 * The permissions structure for Skyra
		 * @type {PermissionLevels}
		 */
		this.permissionLevels = this.validatePermissionLevels();

		/**
		 * The threshold for how old command messages can be before sweeping since the last edit in seconds
		 * @type {number}
		 */
		this.commandMessageLifetime = 60;

		/**
		 * The interval duration for which command messages should be sweept in seconds
		 * @type {number}
		 */
		this.commandMessageSweep = 120;

		/**
		 * Whether the client is truely ready or not
		 * @type {boolean}
		 */
		this.ready = false;

		/**
		 * The version of Skyra
		 * @type {string}
		 */
		this.version = require('./index').version;

		/**
		 * The handler that manages Skyra's innest core
		 * @type {Handler}
		 */
		this.handler = new Handler(this);

		/**
		 * The application info cached from the discord api
		 * @type {object}
		 */
		this.application = null;

		this.registerStore(this.commands)
			.registerStore(this.inhibitors)
			.registerStore(this.finalizers)
			.registerStore(this.monitors)
			.registerStore(this.languages)
			.registerStore(this.events)
			.registerStore(this.extendables);

		this.usage = {
			cpu: new Array(96).fill(0),
			prc: new Array(96).fill(0),
			ram: new Array(96).fill(0)
		};

		this.updateStats();
		setInterval(this.updateStats.bind(this), 300000);

		this.redis = new Redis.Client('localhost');

		this.redis
			.on('ready', () => this.emit('log', 'Redis-Nextra is ready.', 'debug'))
			.on('serverReconnect', server => this.emit('log', `Redis server: ${server.host.string} is reconnecting`, 'warn'))
			.on('error', err => this.emit('log', `Redis Error: ${err}`, 'error'));

		this.once('ready', this._ready.bind(this));
	}

	/**
     * The invite link for the bot
     * @readonly
     * @returns {string}
     */
	get invite() {
		if (!this.user.bot) throw 'Why would you need an invite link for a selfbot...';
		const permissions = Discord.Permissions.resolve([...new Set(this.commands.reduce((a, b) => a.concat(b.botPerms), ['VIEW_CHANNEL', 'SEND_MESSAGES']))]);
		return `https://discordapp.com/oauth2/authorize?client_id=${this.application.id}&permissions=${permissions}&scope=bot`;
	}

	/**
     * Validates the permission structure passed to the client
     * @private
     * @returns {PermissionLevels}
     */
	validatePermissionLevels() {
		if (PermStructure.isValid()) return PermStructure;
		throw new Error(PermStructure.debug());
	}

	/**
	 * Registers a custom store to the client
	 * @param {Store} store The store that pieces will be stored in.
	 * @returns {Skyra} this client
	 */
	registerStore(store) {
		this.pieceStores.set(store.name, store);
		return this;
	}

	/**
	 * Unregisters a custom store from the client
	 * @param {Store} storeName The store that pieces will be stored in.
	 * @returns {Skyra} this client
	 */
	unregisterStore(storeName) {
		this.pieceStores.delete(storeName);
		return this;
	}

	/**
	 * Registers a custom piece to the client
	 * @param {string} pieceName The name of the piece, if you want to register an arg resolver for this piece
	 * @param {Store} store The store that pieces will be stored in.
	 * @returns {Skyra} this client
	 */
	registerPiece(pieceName, store) {
		// eslint-disable-next-line func-names
		ArgResolver.prototype[pieceName] = async function (arg, currentUsage, possible, repeat, msg) {
			const piece = store.get(arg);
			if (piece) return piece;
			if (currentUsage.type === 'optional' && !repeat) return null;
			throw msg.language.get('RESOLVER_INVALID_PIECE', currentUsage.possibles[possible].name, pieceName);
		};
		return this;
	}

	/**
	 * Unregisters a custom piece from the client
	 * @param {string} pieceName The name of the piece
	 * @returns {Skyra} this client
	 */
	unregisterPiece(pieceName) {
		delete ArgResolver.prototype[pieceName];
		return this;
	}

	/**
     * Use this to login to Discord with your bot
     * @param {string} token Your bot token
     * @returns {Promise<string>}
     */
	async login(token) {
		const timer = new StopWatch();
		const loaded = await Promise.all(this.pieceStores.map(async store => `Loaded ${await store.loadAll()} ${store.name}.`)).catch((err) => {
			console.error(err);
			process.exit();
		});
		this.emit('log', loaded.join('\n'));
		this.settings.add('guilds');
		this.emit('log', `Loaded in ${timer.stop()}.`);
		return super.login(token);
	}

	get owner() {
		return this.users.get(this.config.ownerID);
	}

	async _ready() {
		this.config.prefixMention = new RegExp(`^<@!?${this.user.id}>`);
		this.config.ignoreBots = true;
		this.config.ignoreSelf = true;

		const [application] = await Promise.all([
			super.fetchApplication(),
			this.commands.init(),
			this.inhibitors.init(),
			this.finalizers.init(),
			this.monitors.init(),
			this.handler.init()
		]);

		this.application = application;
		this.config.ownerID = '242043489611808769';
		util.initClean(this);

		this.setInterval(this.sweepCommandMessages.bind(this), this.commandMessageSweep * 1000);
		this.ready = true;
		this.emit('log', `Skyra ${this.version} ready! [ ${this.guilds.size} [G]] [ ${this.guilds.reduce((a, b) => a + b.memberCount, 0).toLocaleString()} [U]].`);
	}

	sweepCommandMessages(lifetime = this.commandMessageLifetime) {
		if (typeof lifetime !== 'number' || isNaN(lifetime)) throw new TypeError('The lifetime must be a number.');
		if (lifetime <= 0) {
			this.emit('debug', "Didn't sweep messages - lifetime is unlimited");
			return -1;
		}

		const lifetimeMs = lifetime * 1000;
		const rightNow = Date.now();
		const messages = this.commandMessages.size;

		for (const [key, message] of this.commandMessages) {
			if (rightNow - (message.trigger.editedTimestamp || message.trigger.createdTimestamp) > lifetimeMs) this.commandMessages.delete(key);
		}

		this.emit('debug', `Swept ${messages - this.commandMessages.size} commandMessages older than ${lifetime} seconds.`);
		return messages - this.commandMessages.size;
	}

	updateStats() {
		this.usage.cpu.splice(0, 1);
		this.usage.prc.splice(0, 1);
		this.usage.ram.splice(0, 1);

		this.usage.cpu.push(Math.round(loadavg()[0] * 10000) / 100);
		this.usage.prc.push(Math.round(100 * (process.memoryUsage().heapTotal / 1048576)) / 100);
		this.usage.ram.push(Math.round(100 * (process.memoryUsage().heapUsed / 1048576)) / 100);
	}

}

module.exports = Skyra;

// Structures
const CommandStore = require('./structures/CommandStore');
const InhibitorStore = require('./structures/InhibitorStore');
const FinalizerStore = require('./structures/FinalizerStore');
const MonitorStore = require('./structures/MonitorStore');
const LanguageStore = require('./structures/LanguageStore');
const EventStore = require('./structures/EventStore');
const ExtendableStore = require('./structures/ExtendableStore');
const PermissionLevels = require('./structures/PermissionLevels');

// Parsers
const ArgResolver = require('./parsers/ArgResolver');

// Settings
const SettingsCache = require('./settings/SettingsCache');

// Utils
const util = require('./util/util');
const Handler = require('./management/Handler');
const Console = require('./console/Console');

const PermStructure = new PermissionLevels()
	.addLevel(0, false, () => true)
	.addLevel(1, false, (client, msg, settings) => {
		if (!msg.guild || !msg.member) return false;
		if (settings.roles.staff)
			return msg.member.roles.has(settings.roles.staff);

		return msg.member.permissions.has('MANAGE_MESSAGES');
	})
	.addLevel(2, false, (client, msg, settings) => {
		if (!msg.guild || !msg.member) return false;
		if (settings.roles.moderator)
			return msg.member.roles.has(settings.roles.moderator);

		return msg.member.permissions.has('BAN_MEMBERS');
	})
	.addLevel(3, false, (client, msg, settings) => {
		if (!msg.guild || !msg.member) return false;
		if (settings.roles.admin)
			return msg.member.roles.has(settings.roles.admin);

		return msg.member.permissions.has('ADMINISTRATOR');
	})
	.addLevel(4, false, (client, msg) => {
		if (!msg.guild || !msg.member) return false;
		return msg.author.id === msg.guild.owner.id;
	})
	.addLevel(9, true, (client, msg) => msg.author.id === client.config.ownerID)
	.addLevel(10, false, (client, msg) => msg.author.id === client.config.ownerID);
