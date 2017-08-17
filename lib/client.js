const Discord = require('discord.js');
const path = require('path');
const now = require('performance-now');
const ArgResolver = require('./parsers/ArgResolver');
const SettingGateway = require('./parsers/settingGateway');
const PermLevels = require('./structures/PermissionLevels');
const util = require('./util/util');
const CommandStore = require('./structures/CommandStore');
const InhibitorStore = require('./structures/InhibitorStore');
const FinalizerStore = require('./structures/FinalizerStore');
const MonitorStore = require('./structures/MonitorStore');
const LanguageStore = require('./structures/LanguageStore');
const EventStore = require('./structures/EventStore');
const ExtendableStore = require('./structures/ExtendableStore');
const Handler = require('../utils/handler');

const PermStructure = new PermLevels()
    .addLevel(0, false, () => true)
    .addLevel(1, false, (client, msg, settings) => {
        if (!msg.guild) return false;
        if (settings.roles.staff) {
            return msg.member.roles.has(settings.roles.staff);
        }
        return msg.member.permissions.has('MANAGE_MESSAGES');
    })
    .addLevel(2, false, (client, msg, settings) => {
        if (!msg.guild) return false;
        if (settings.roles.moderator) {
            return msg.member.roles.has(settings.roles.moderator);
        }
        return msg.member.permissions.has('BAN_MEMBERS');
    })
    .addLevel(3, false, (client, msg, settings) => {
        if (!msg.guild) return false;
        if (settings.roles.admin) {
            return msg.member.roles.has(settings.roles.admin);
        }
        return msg.member.permissions.has('ADMINISTRATOR');
    })
    .addLevel(4, false, (client, msg) => {
        if (!msg.guild) return false;
        return msg.author.id === msg.guild.owner.id;
    })
    .addLevel(9, true, (client, msg) => msg.author.id === client.config.ownerID)
    .addLevel(10, false, (client, msg) => msg.author.id === client.config.ownerID);

class Skyra extends Discord.Client {

    constructor(config = {}) {
        super(config.clientOptions);

        this.config = config;
        this.config.language = config.language || 'en-US';
        this.baseDir = path.join(__dirname, '../');
        this.argResolver = new ArgResolver(this);
        this.commands = new CommandStore(this);
        this.inhibitors = new InhibitorStore(this);
        this.finalizers = new FinalizerStore(this);
        this.monitors = new MonitorStore(this);
        this.languages = new LanguageStore(this);
        this.events = new EventStore(this);
        this.extendables = new ExtendableStore(this);
        this.commandMessages = new Discord.Collection();
        this.permissionLevels = this.validatePermissionLevels();
        this.commandMessageLifetime = 60;
        this.commandMessageSweep = 120;
        this.ready = false;
        this.version = '2.0.0 LNU';
        this.settingGateway = new SettingGateway(this);
        this.handler = new Handler(this);
        this.application = null;

        this.once('ready', this._ready.bind(this));
    }

    /**
     * The invite link for the bot
     * @readonly
     * @returns {string}
     */
    get invite() {
        if (!this.user.bot) throw 'Why would you need an invite link for a selfbot...';
        const permissions = Discord.Permissions.resolve([...new Set(this.commands.reduce((a, b) => a.concat(b.botPerms), ['READ_MESSAGES', 'SEND_MESSAGES']))]);
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
     * Use this to login to Discord with your bot
     * @param {string} token Your bot token
     */
    async login(token) {
        const start = now();
        const [[commands, aliases], inhibitors, finalizers, events, monitors, languages, extendables] = await Promise.all([
            this.commands.loadAll(),
            this.inhibitors.loadAll(),
            this.finalizers.loadAll(),
            this.events.loadAll(),
            this.monitors.loadAll(),
            this.languages.loadAll(),
            this.extendables.loadAll()
        ]).catch((err) => {
            console.error(err);
            process.exit();
        });
        this.emit('log', [
            `Loaded ${commands} commands, with ${aliases} aliases.`,
            `Loaded ${inhibitors} command inhibitors.`,
            `Loaded ${finalizers} command finalizers.`,
            `Loaded ${monitors} message monitors.`,
            `Loaded ${languages} languages.`,
            `Loaded ${events} events.`,
            `Loaded ${extendables} extendables.`
        ].join('\n'));
        await this.handler.init();
        this.emit('log', `Loaded in ${(now() - start).toFixed(2)}ms.`);
        super.login(token);
    }

    get owner() {
        return this.users.get(this.config.ownerID);
    }

    async _ready() {
        this.config.prefixMention = new RegExp(`^<@!?${this.user.id}>`);
        if (this.config.ignoreBots === undefined) this.config.ignoreBots = true;
        if (this.config.ignoreSelf === undefined) this.config.ignoreSelf = this.user.bot;
        if (this.user.bot) this.application = await super.fetchApplication();
        if (!this.config.ownerID) this.config.ownerID = this.user.bot ? this.application.owner.id : this.user.id;
        await this.settingGateway.init();
        await this.commands.init();
        await this.inhibitors.init();
        await this.finalizers.init();
        await this.monitors.init();
        util.initClean(this);
        this.setInterval(this.sweepCommandMessages.bind(this), this.commandMessageSweep * 1000);
        this.ready = true;
        this.emit('log', `Skyra LNU ready! [ ${this.guilds.size} [G]] [ ${this.guilds.reduce((a, b) => a + b.memberCount, 0).toLocaleString()} [U]].`);
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

}

module.exports = Skyra;

process.on('unhandledRejection', (err) => {
    if (!err) return;
    console.error(`Uncaught Promise Error: \n${err.stack || err}`);
});
