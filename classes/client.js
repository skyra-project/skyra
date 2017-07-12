const { Client, Collection, Permissions } = require("discord.js");
const path = require("path");
const now = require("performance-now");
const CommandMessage = require("./commandMessage");
const Loader = require("./loader");
const ArgResolver = require("./argResolver");
const PermLevels = require("./permLevels");
const Initialize = require("../functions/initializer");
// const Clock = require("../utils/clock");

const PermStructure = new PermLevels()
    .addLevel(0, false, () => true)
    .addLevel(1, false, (client, msg) => {
        if (!msg.guild) return false;
        // if (msg.guild.settings && msg.guild.settings.roles.staff && msg.member.roles.has(msg.guild.settings.roles.staff)) return true;
        else if (msg.member.hasPermission("MANAGE_MESSAGES")) return true;
        return false;
    })
    .addLevel(2, false, (client, msg) => {
        if (!msg.guild) return false;
        // if (msg.guild.settings && msg.guild.settings.roles.moderator && msg.member.roles.has(msg.guild.settings.roles.moderator)) return true;
        else if (msg.member.hasPermission("BAN_MEMBERS")) return true;
        return false;
    })
    .addLevel(3, false, (client, msg) => {
        if (!msg.guild) return false;
        // if (msg.guild.settings && msg.guild.settings.roles.admin && msg.member.roles.has(msg.guild.settings.roles.admin)) return true;
        else if (msg.member.hasPermission("ADMINISTRATOR")) return true;
        return false;
    })
    .addLevel(4, false, (client, msg) => {
        if (!msg.guild) return false;
        return msg.author.id === msg.guild.owner.id;
    })
    .addLevel(9, true, (client, msg) => msg.author.id === client.config.ownerID)
    .addLevel(10, false, (client, msg) => msg.author.id === client.config.ownerID)
    .structure;

/* eslint-disable no-throw-literal, no-use-before-define, no-restricted-syntax, no-underscore-dangle */
module.exports = class Komada extends Client {

    constructor(config = {}) {
        if (typeof config !== "object") throw new TypeError("Configuration for Komada must be an object.");
        super(config.clientOptions);
        this.config = config;
        this.baseDir = path.join(__dirname, "../");
        this.funcs = new Loader(this);
        this.argResolver = new ArgResolver(this);
        this.commands = new Collection();
        this.aliases = new Collection();
        this.commandInhibitors = new Collection();
        this.commandFinalizers = new Collection();
        this.messageMonitors = new Collection();
        this.eventHandlers = new Collection();
        this.permStructure = PermStructure;
        this.CommandMessage = CommandMessage;
        this.commandMessages = new Collection();
        this.commandMessageLifetime = 60;
        this.commandMessageSweep = 120;
        this.ready = false;
        this.application = null;
        this.version = "1.10.0 TLU";
        // this.clock = new Clock(this);
        this.once("ready", this._ready.bind(this));
    }

    get invite() {
        if (!this.user.bot) throw "Why would you need an invite link for a selfbot...";
        const permissions = Permissions.resolve([...new Set(this.commands.reduce((a, b) => a.concat(b.conf.botPerms), ["READ_MESSAGES", "SEND_MESSAGES"]))]);
        return `https://discordapp.com/oauth2/authorize?client_id=${this.application.id}&permissions=${permissions}&scope=bot`;
    }

    async login(token) {
        const start = now();
        await this.funcs.loadAll(this);
        this.emit("log", `Loaded in ${(now() - start).toFixed(2)}ms.`);
        super.login(token);
    }

    async _ready() {
        this.config.prefixMention = new RegExp(`^<@!?${this.user.id}>`);
        if (this.user.bot) this.application = await super.fetchApplication();
        await Promise.all(this.commands.map((piece) => {
            if (piece.init) return piece.init(this);
            return true;
        }));
        await Promise.all(this.commandInhibitors.map((piece) => {
            if (piece.init) return piece.init(this);
            return true;
        }));
        await Promise.all(this.commandFinalizers.map((piece) => {
            if (piece.init) return piece.init(this);
            return true;
        }));
        await Promise.all(this.messageMonitors.map((piece) => {
            if (piece.init) return piece.init(this);
            return true;
        }));
        await Initialize(this);
        // await this.clock.init();
        this.setInterval(this.sweepCommandMessages.bind(this), this.commandMessageLifetime);
        this.ready = true;
        this.emit("log", `Skyra ThunderLight ready! [ ${this.guilds.size} [G]] [ ${this.guilds.reduce((a, b) => a + b.memberCount, 0).toLocaleString()} [U]].`);
    }

    sweepCommandMessages(lifetime = this.commandMessageLifetime) {
        if (typeof lifetime !== "number" || isNaN(lifetime)) throw new TypeError("The lifetime must be a number.");
        if (lifetime <= 0) {
            this.emit("debug", "Didn't sweep messages - lifetime is unlimited");
            return -1;
        }

        const lifetimeMs = lifetime * 1000;
        const rightNow = Date.now();
        const messages = this.commandMessages.size;

        for (const [key, message] of this.commandMessages) {
            if (rightNow - (message.trigger.editedTimestamp || message.trigger.createdTimestamp) > lifetimeMs) this.commandMessages.delete(key);
        }

        this.emit("debug", `Swept ${messages - this.commandMessages.size} commandMessages older than ${lifetime} seconds.`);
        return messages - this.commandMessages.size;
    }

};

process.on("unhandledRejection", (err) => {
    if (!err) return;
    console.error(`Uncaught Promise Error: \n${err.stack || err}`);
});
