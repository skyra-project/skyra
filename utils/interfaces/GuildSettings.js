const provider = require('../../providers/rethink');
const Moderation = require('./moderation');

const superRegExp = (filterArray) => {
    const filtered = filterArray.reduce((acum, item, index) => acum + (index ? '|' : '') +
        item.replace(/\w(?=(\w)?)/g, (letter, nextWord) => `${letter}+${nextWord ? '\\W*' : ''}`), '');
    return new RegExp(`\\b(?:${filtered})\\b`, 'i');
};

/**
 * Global settings for guilds.
 * @class GuildSettings
 */
class GuildSettings {

    /**
     * @typedef  {Object}   SFilter
     * @property {number}   [level=0]     The level the Word Filter system should operate in.
     * @property {string[]} [raw=Array]   The filtered words.
     * @property {RegExp}   [regexp=null] The SuperRegExp made by the array of filtered words.
     */

    /**
     * @typedef  {Object}  SSelfMod
     * @property {boolean} [ghostmention=false]  Whether Skyra should alert users when somebody ghost mentions.
     * @property {boolean} [inviteLinks=false]   Whether Skyra should block invite links.
     * @property {boolean} [nomentionspam=false] Whether Skyra should enable NoMentionSpam3 systems.
     * @property {number}  [nmsthreshold=20]     The amount of points a user has to reach to get hammered by Skyra.
     */

    /**
     * @typedef  {Object} SSocial
     * @property {number} [boost=1]        The boost amount for games.
     * @property {number} [monitorBoost=1] The boost amount for the Social Monitor.
     */

    /**
     * @typedef  {Object} AutoRole
     * @property {string} id     The ID of the role.
     * @property {number} points The amount of points the user needs to be given a role.
     */

    /**
     * @typedef  {Object}  SMessages
     * @property {boolean} [farewell=false]         Whether Skyra should send farewell messages.
     * @property {string}  [farewellMessage=string] The message Skyra should use as farewell message.
     * @property {boolean} [greeting=false]         Whether Skyra should send greeting messages.
     * @property {string}  [greetingMessage=string] The message Skyra should use as greeting message.
     */

    /**
     * @typedef  {Object} SChannels
     * @property {string} [announcement=null] The channel Skyra should use to send announcements. (Coming soon)
     * @property {string} [default=null]      The channel Skyra should use to send greetings/farewells.
     * @property {string} [log=null]          The channel Skyra should use to display the logs.
     * @property {string} [modlog=null]       The channel Skyra should use to display the modlogs.
     * @property {string} [spam=null]         The channel Skyra should lock the spammy commands to.
     */

    /**
     * @typedef  {Object}  SEvents
     * @property {boolean} [channelCreate=false]     Whether Skyra should log new channels creation.
     * @property {boolean} [guildBanAdd=false]       Whether Skyra should log new bans.
     * @property {boolean} [guildBanRemove=false]    Whether Skyra should log new unbans.
     * @property {boolean} [guildMemberAdd=false]    Whether Skyra should log new members.
     * @property {boolean} [guildMemberRemove=false] Whether Skyra should log when a member leaves.
     * @property {boolean} [guildMemberUpdate=false] Whether Skyra should log members' changes.
     * @property {boolean} [messageDelete=false]     Whether Skyra should log messages deleted.
     * @property {boolean} [messageBulkDelete=false] Whether Skyra should log prunes (From OAuth Bots).
     * @property {boolean} [messageUpdate=false]     Whether Skyra should log messages edited.
     * @property {boolean} [roleUpdate=false]        Whether Skyra should log roles updates.
     * @property {boolean} [commands=false]          Whether Skyra should log commands used.
     * @property {boolean} [modLogProtection=false]  Whether Skyra should protect the modlogs.
     */

    /**
     * @typedef  {Object} SRoles
     * @property {string} [admin=null]     The administrator role which inherits the permission level 3.
     * @property {string} [moderator=null] The moderator role which inherits the permission level 2.
     * @property {string} [staff=null]     The staff role which inherits the permission level 1.
     * @property {string} [muted=null]     The muted role which is given when using the mute command.
     */

    /**
     * @typedef  {Object}     Settings
     * @property {string}     [prefix=s!]                 The prefix for the Guild Setting.
     * @property {SRoles}     [roles={}]                  The Roles settings.
     * @property {SEvents}    [events={}]                 The Events settings.
     * @property {SChannels}  [channels={}]               The Channels settings.
     * @property {SMessages}  [messages={}]               The Messages settings.
     * @property {string[]}   [ignoreChannels=Array]      The channels Skyra ignores.
     * @property {string[]}   [disabledCommands=Array]    The disabled commands.
     * @property {string[]}   [disabledCmdChannels=Array] The channels Skyra does not execute commands in.
     * @property {AutoRole[]} [publicRoles=Array]         The roles available for Skyra to give.
     * @property {number}     [mode=0]                    The mode Skyra should ejecute in.
     * @property {string}     [initialRole=null]          The role Skyra should give when somebody joins the guild.
     * @property {SSocial}    [social={}]                 Private. The amount of points Skyra gives.
     * @property {SSelfMod}   [selfmod={}]                The SelfMod settings.
     * @property {SFilter}    [filter={}]                 The Word Filter settings.
     */

    /**
     * Creates an instance of GuildSettings.
     * @param {string}        id                 The ID of the guild.
     * @param {GuildSettings} [data={}]          The Guild Settings.
     * @param {Array<{}>}     [moderation=Array] The modlogs.
     * @memberof GuildSettings
     */
    constructor(id, data = {}, moderation = []) { // eslint-disable-line complexity
        Object.defineProperty(this, 'id', { value: id });

        this.prefix = data.prefix || 's!';
        this.roles = data.roles || {};
        this.events = data.events || {};
        this.channels = data.channels || {};
        this.messages = data.messages || {};

        this.ignoreChannels = data.ignoreChannels || [];
        this.disabledCommands = data.disabledCommands || [];
        this.disabledCmdChannels = data.disabledCmdChannels || [];
        this.publicRoles = data.publicRoles || [];
        this.autoroles = data.autoroles || [];

        this.mode = data.mode || 0;
        this.initialRole = data.initialRole || null;

        if (!data.social) data.social = {};
        this.social = {
            boost: data.social.boost || 1,
            monitorBoost: data.social.monitorBoost || 1
        };

        if (!data.selfmod) data.selfmod = {};
        this.selfmod = {
            ghostmention: data.selfmod.ghostmention || false,
            inviteLinks: data.selfmoda.inviteLinks || false,
            nomentionspam: data.selfmod.nomentionspam || false,
            nmsthreshold: data.selfmod.nmsthreshold || 20
        };

        if (!data.filter) data.filter = {};
        this.filter = {
            level: data.filter.level || 0,
            raw: data.filter.raw || [],
            regexp: null
        };

        this.moderation = new Moderation(this.id, moderation);
    }

    /**
     * Update the Guild settings
     * @param {Settings} doc The document to update.
     * @returns {GuildSettings}
     * @memberof GuildSettings
     */
    async update(doc) {
        await provider.update('guilds', this.id, doc);
        for (const [key, value] of Object.entries(doc)) {
            if (value instanceof Object) {
                for (const [subkey, subvalue] of Object.entries(value)) this[key][subkey] = subvalue;
            } else {
                this[key] = value;
            }
        }
        return this;
    }

    /**
     * Update the WordFilter RegExp
     * @param {any} value Ignore this.
     * @memberof GuildSettings
     */
    set filterRegExp(value) {
        this.filter.regexp = superRegExp(this.filter.raw);
        return this.filter.regexp;
    }

    /**
     * Get the WordFilter RegExp, or generate one if it was not cached.
     * @readonly
     * @memberof GuildSettings
     */
    get filterRegExp() {
        if (this.filter.regexp === null) this.filter.regexp = superRegExp(this.filter.raw);
        return this.filter.regexp;
    }

    /**
     * Get the data in JSON.
     * @returns {Settings}
     * @memberof GuildSettings
     */
    toJSON() {
        return {
            prefix: this.prefix,
            roles: this.roles,
            events: this.events,
            channels: this.channels,
            messages: this.messages,
            ignoreChannels: this.ignoreChannels,
            disabledCommands: this.disabledCommands,
            disabledCmdChannels: this.disabledCmdChannels,
            publicRoles: this.publicRoles,
            autoroles: this.autoroles,
            mode: this.mode,
            initialRole: this.initialRole,
            social: this.social,
            selfmod: this.selfmod,
            filter: {
                level: this.filter.level,
                raw: this.filter.raw
            }
        };
    }

    /**
     * Generate SuperRegExps.
     * @static
     * @param {string[]} array Array of strings to resolve.
     * @returns {RegExp}
     * @memberof GuildSettings
     */
    static superRegExp(array) {
        return superRegExp(array);
    }

}

module.exports = GuildSettings;
