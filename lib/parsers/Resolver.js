const url = require('url');
const { Message, User, GuildMember, Role, Guild, Channel } = require('discord.js');

/**
 * The base resolver class
 */
class Resolver {

    constructor(client) {
        Object.defineProperty(this, 'client', { value: client });
    }

    /**
     * Fetch a Message object by its Snowflake or instanceof Message.
     * @param {Snowflake} message The message snowflake to validate.
     * @param {Channel} channel The Channel object in which the message can be found.
     * @returns {Promise<?Message>}
     */
    async msg(message, channel) {
        if (message instanceof Message) return message;
        return typeof message === 'string' && this.constructor.regex.snowflake.test(message)
            ? channel.messages.fetch(message).catch(() => null)
            : null;
    }

    /**
     * Resolve a User object by its instance of User, GuildMember, or by its Snowflake.
     * @param {User} user The user to validate.
     * @returns {Promise<?User>}
     */
    async user(user) {
        if (user instanceof User) return user;
        if (user instanceof GuildMember) return user.user;
        return typeof user === 'string' && this.constructor.regex.userOrMember.test(user)
            ? this.client.users.fetch(this.constructor.regex.userOrMember.exec(user)[1]).catch(() => null)
            : null;
    }

    advUser(query, msg) {
        return this.client.handler.search.user(query, msg).catch(() => null);
    }

    /**
     * Resolve a GuildMember object by its instance of GuildMember, User, or by its Snowflake.
     * @param {(GuildMember|User|Snowflake)} member The number to validate.
     * @param {Guild} guild The Guild object in which the member can be found.
     * @returns {Promise<?GuildMember>}
     */
    async member(member, guild) {
        if (member instanceof GuildMember) return member;
        if (member instanceof User) return guild.members.fetch(member);
        if (typeof member === 'string' && this.constructor.regex.userOrMember.test(member)) {
            const user = await this.client.users.fetch(this.constructor.regex.userOrMember.exec(member)[1]).catch(() => null);
            if (user) return guild.members.fetch(user).catch(() => null);
        }
        return null;
    }

    async advMember(query, msg) {
        const user = await this.advUser(query, msg);
        return user ? msg.guild.members.fetch(user).catch(() => null) : null;
    }

    /**
     * Resolve a Channel object by its instance of Channel, or by its Snowflake.
     * @param {(Channel|Snowflake)} channel The channel to validate.
     * @param {Guild} guild The Guild object in which the channel can be found.
     * @returns {Promise<?Channel>}
     */
    async channel(channel, guild) {
        if (channel instanceof Channel) return channel;
        if (typeof channel === 'string') {
            if (this.constructor.regex.channel.test(channel)) {
                return this.client.channels.get(this.constructor.regex.channel.exec(channel)[1]);
            }
            if (guild) return guild.channels.find('name', channel);
        }
        return null;
    }

    async advChannel(channel, msg) {
        return this.client.handler.search.channel(channel, msg).catch(() => null);
    }

    /**
     * Resolve a Guild object by its instance of Guild, or by its Snowflake.
     * @param {(Guild|Snowflake)} guild The guild to validate/find.
     * @returns {Promise<?Guild>}
     */
    async guild(guild) {
        if (guild instanceof Guild) return guild;
        if (typeof guild === 'string' && this.constructor.regex.snowflake.test(guild)) return this.client.guilds.get(guild);
        return null;
    }

    /**
     * Resolve a Role object by its instance of Role, or by its Snowflake.
     * @param {(Role|Snowflake)} role The role to validate/find.
     * @param {Guild} guild The Guild object in which the role can be found.
     * @returns {Promise<?Role>}
     */
    async role(role, guild) {
        if (role instanceof Role) return role;
        if (typeof role === 'string') {
            if (this.constructor.regex.role.test(role)) {
                return guild.roles.get(this.constructor.regex.role.exec(role)[1]);
            }
            if (guild) return guild.roles.find('name', role);
        }
        return null;
    }

    advRole(query, msg) {
        return this.client.handler.search.role(query, msg).catch(() => null);
    }

    /**
     * Resolve a Boolean instance.
     * @param {(boolean|string)} bool The boolean to validate.
     * @returns {Promise<?boolean>}
     */
    boolean(bool) {
        if (bool instanceof Boolean) return Promise.resolve(bool);
        if (['1', 'true', '+', 't', 'yes', 'y', 'on'].includes(String(bool).toLowerCase())) return Promise.resolve(true);
        if (['0', 'false', '-', 'f', 'no', 'n', 'off'].includes(String(bool).toLowerCase())) return Promise.resolve(false);
        return Promise.resolve(null);
    }

    /**
     * Resolve a String instance.
     * @param {string} string The string to validate.
     * @returns {Promise<?string>}
     */
    string(string) {
        return Promise.resolve(String(string));
    }

    /**
     * Resolve an Integer.
     * @param {(string|number)} integer The integer to validate.
     * @returns {Promise<?number>}
     */
    async integer(integer) {
        if (/^\d+$/.test(integer) === false) return null;
        integer = parseInt(integer);
        if (Number.isInteger(integer)) return integer;
        return null;
    }

    /**
     * Resolve a Float.
     * @param {(string|number)} number The float to validate.
     * @returns {Promise<?number>}
     */
    async float(number) {
        if (/^\d*(\.\d+)?$/.test(number) === false) return null;
        number = parseFloat(number);
        if (isNaN(number) === false) return number;
        return null;
    }

    /**
     * Resolve a hyperlink.
     * @param {string} hyperlink The hyperlink to validate.
     * @returns {Promise<?string>}
     */
    url(hyperlink) {
        const res = url.parse(hyperlink);
        if (res.protocol && res.hostname) return Promise.resolve(hyperlink);
        return Promise.resolve(null);
    }

    /**
     * Resolve an attachment.
     * @param {string} hyperlink The hyperlink to validate.
     * @param {Message} msg A message instance.
     * @returns {Promise<?string>}
     */
    async attachment(hyperlink, msg) {
        let res;
        if (msg.attachments.size > 0)
            res = msg.attachments.first().url;
        else
            res = await this.url(hyperlink);

        return /(?:jpg|png|gif|webm)$/.test(res) ? res : null;
    }

}

/**
 * Standard regular expressions for matching mentions and snowflake ids
 * @type {Object}
 * @property {RegExp} userOrMember Regex for users or members
 * @property {RegExp} channel Regex for channels
 * @property {RegExp} role Regex for roles
 * @property {RegExp} snowflake Regex for simple snowflake ids
 */
Resolver.regex = {
    userOrMember: new RegExp('^(?:<@!?)?(\\d{17,19})>?$'),
    channel: new RegExp('^(?:<#)?(\\d{17,19})>?$'),
    role: new RegExp('^(?:<@&)?(\\d{17,19})>?$'),
    snowflake: new RegExp('^(\\d{17,19})$')
};

module.exports = Resolver;
