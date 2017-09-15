const Resolver = require('./Resolver');

/**
 * The setting resolver
 * @extends Resolver
 */
class SettingResolver extends Resolver {

    /**
     * Resolves a user
     * @param {any} data The data to resolve
     * @param {external:Guild} guild The guild to resolve for
     * @param {string} name The name of the key being resolved
     * @returns {external:User}
     */
    async user(data, guild, name) {
        const result = await super.user(data);
        if (result === null)
            throw ['RESOLVER_INVALID_USER', name];
        return result;
    }

    /**
     * Resolves a channel
     * @param {any} data The data to resolve
     * @param {external:Guild} guild The guild to resolve for
     * @param {string} name The name of the key being resolved
     * @returns {external:Channel}
     */
    async channel(data, guild, name) {
        const result = await super.channel(data, guild);
        if (result === null)
            throw ['RESOLVER_INVALID_CHANNEL', name];
        return result;
    }

    /**
     * Resolves a TextChannel
     * @param {any} data The data to resolve
     * @param {external:Guild} guild The guild to resolve for
     * @param {string} name The name of the key being resolved
     * @returns {external:Channel}
     */
    async textchannel(data, guild, name) {
        const result = await this.channel(data, guild);
        if (result.type !== 'text')
            throw ['RESOLVER_INVALID_TEXTCHANNEL', name];
        return result;
    }

    /**
     * Resolves a VoiceChannel
     * @param {any} data The data to resolve
     * @param {external:Guild} guild The guild to resolve for
     * @param {string} name The name of the key being resolved
     * @returns {external:Channel}
     */
    async voicechannel(data, guild, name) {
        const result = await this.channel(data, guild);
        if (result.type !== 'voice')
            throw ['RESOLVER_INVALID_VOICECHANNEL', name];
        return result;
    }

    /**
     * Resolves a guild
     * @param {any} data The data to resolve
     * @param {external:Guild} guild The guild to resolve for
     * @param {string} name The name of the key being resolved
     * @returns {external:Guild}
     */
    async guild(data, guild, name) {
        const result = await super.guild(data);
        if (result === null)
            throw ['RESOLVER_INVALID_GUILD', name];
        return result;
    }

    /**
     * Resolves a role
     * @param {any} data The data to resolve
     * @param {external:Guild} guild The guild to resolve for
     * @param {string} name The name of the key being resolved
     * @returns {external:Role}
     */
    async role(data, guild, name) {
        const result = await super.role(data, guild);
        if (result === null)
            throw ['RESOLVER_INVALID_ROLE', name];
        return result;
    }

    /**
     * Resolves a boolean
     * @param {any} data The data to resolve
     * @param {external:Guild} guild The guild to resolve for
     * @param {string} name The name of the key being resolved
     * @returns {boolean}
     */
    async boolean(data, guild, name) {
        const result = await super.boolean(data);
        if (result === null)
            throw ['RESOLVER_INVALID_BOOL', name];
        return result;
    }

    /**
     * Resolves a string
     * @param {any} data The data to resolve
     * @param {external:Guild} guild The guild to resolve for
     * @param {string} name The name of the key being resolved
     * @param {Object} minMax The minimum and maximum
     * @param {?number} minMax.min The minumum value
     * @param {?number} minMax.max The maximum value
     * @returns {string}
     */
    async string(data, guild, name, { min, max } = {}) {
        const result = await super.string(data);
        return SettingResolver.maxOrMin(guild, result, min, max, name, guild.language.get('RESOLVER_STRING_SUFFIX'));
    }

    /**
     * Resolves a integer
     * @param {any} data The data to resolve
     * @param {external:Guild} guild The guild to resolve for
     * @param {string} name The name of the key being resolved
     * @param {Object} minMax The minimum and maximum
     * @param {?number} minMax.min The minumum value
     * @param {?number} minMax.max The maximum value
     * @returns {number}
     */
    async integer(data, guild, name, { min, max } = {}) {
        const result = await super.integer(data);
        if (result === null)
            throw ['SETTING_RESOLVER_INVALID_INTEGER'];
        return SettingResolver.maxOrMin(guild, result, min, max, name);
    }

    /**
     * Resolves a float
     * @param {any} data The data to resolve
     * @param {external:Guild} guild The guild to resolve for
     * @param {string} name The name of the key being resolved
     * @param {Object} minMax The minimum and maximum
     * @param {?number} minMax.min The minumum value
     * @param {?number} minMax.max The maximum value
     * @returns {number}
     */
    async float(data, guild, name, { min, max } = {}) {
        const result = await super.float(data);
        if (result === null)
            throw ['RESOLVER_INVALID_FLOAT', name];
        return SettingResolver.maxOrMin(guild, result, min, max, name);
    }

    /**
     * Resolves a hyperlink
     * @param {any} data The data to resolve
     * @param {external:Guild} guild The guild to resolve for
     * @param {string} name The name of the key being resolved
     * @returns {string}
     */
    async url(data, guild, name) {
        const result = await super.url(data);
        if (result === null)
            throw ['RESOLVER_INVALID_URL', name];
        return result;
    }

    /**
     * Resolves a command
     * @param {any} data The data to resolve
     * @param {external:Guild} guild The guild to resolve for
     * @param {string} name The name of the key being resolved
     * @returns {Command}
     */
    async command(data, guild, name) {
        const command = this.client.commands.get(data.toLowerCase());
        if (!command)
            throw ['RESOLVER_INVALID_PIECE', name, 'command'];
        return command.name;
    }

    /**
     * Resolves a command
     * @param {any} data The data to resolve
     * @param {external:Guild} guild The guild to resolve for
     * @param {string} name The name of the key being resolved
     * @returns {Command}
     */
    async language(data, guild, name) {
        const language = this.client.languages.get(data);
        if (!language)
            throw ['RESOLVER_INVALID_PIECE', name, 'language'];
        return language.name;
    }

    /**
     * Check if the input is valid with min and/or max values.
     * @static
     * @param {external:Guild} guild The guild to resolve for
     * @param {number} value The value to check.
     * @param {?number} min Min value.
     * @param {?number} max Max value.
     * @param {string} name The name of the key being resolved
     * @param {string} [suffix=''] The suffix to apply to the error messages
     * @returns {?boolean}
     */
    static async maxOrMin(guild, value, min, max, name, suffix = '') {
        const input = typeof value === 'string' ? value.length : value;
        if (min && max) {
            if (input >= min && input <= max) return value;
            if (min === max) throw ['RESOLVER_MINMAX_EXACTLY', name, min, suffix];
            throw ['RESOLVER_MINMAX_BOTH', name, min, max, suffix];
        } else if (min) {
            if (input >= min) return value;
            throw ['RESOLVER_MINMAX_MIN', name, min, suffix];
        } else if (max) {
            if (input <= max) return value;
            throw ['RESOLVER_MINMAX_MAX', name, max, suffix];
        }
        return value;
    }

}

module.exports = SettingResolver;
