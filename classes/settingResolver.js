const Resolver = require('./Resolver');

/* eslint-disable no-throw-literal, class-methods-use-this */
module.exports = class SettingResolver extends Resolver {

    async user(data) {
        const result = await super.user(data);
        if (!result) throw 'This key expects a User Object or ID.';
        return result;
    }

    async channel(data) {
        const result = await super.channel(data);
        if (!result) throw 'This key expects a Channel Object or ID.';
        return result;
    }

    async guild(data) {
        const result = await super.guild(data);
        if (!result) throw 'This key expects a Guild ID.';
        return result;
    }

    async role(data, guild) {
        const result = await super.role(data, guild) || guild.roles.find('name', data);
        if (!result) throw 'This key expects a Role Object or ID.';
        return result;
    }

    async boolean(data) {
        const result = await super.boolean(data);
        if (!result) throw 'This key expects a Boolean.';
        return result;
    }

    async string(data, guild, { min, max }) {
        const result = await super.string(data);
        SettingResolver.maxOrMin(result.length, min, max).catch((err) => { throw `The string length must be ${err} characters.`; });
        return result;
    }

    async integer(data, guild, { min, max }) {
        const result = await super.integer(data);
        if (!result) throw 'This key expects an Integer value.';
        SettingResolver.maxOrMin(result, min, max).catch((err) => { throw `The integer value must be ${err}.`; });
        return result;
    }

    async float(data, guild, { min, max }) {
        const result = await super.float(data);
        if (!result) throw 'This key expects a Float value.';
        SettingResolver.maxOrMin(result, min, max).catch((err) => { throw `The float value must be ${err}.`; });
        return result;
    }

    async url(data) {
        const result = await super.url(data);
        if (!result) throw 'This key expects an URL (Uniform Resource Locator).';
        return result;
    }

    async command(data) {
        const command = this.client.commands.get(data.toLowerCase()) || this.client.commands.get(this.client.aliases.get(data.toLowerCase()));
        if (!command) throw 'This key expects a Command.';
        return command.help.name;
    }

  /**
   * Check if the input is valid with min and/or max values.
   * @static
   * @param {any} value The value to check.
   * @param {?number} min Min value.
   * @param {?number} max Max value.
   * @returns {?boolean}
   */
    static async maxOrMin(value, min, max) {
        if (min && max) {
            if (value >= min && value <= max) return true;
            if (min === max) throw `exactly ${min}`;
            throw `between ${min} and ${max}`;
        } else if (min) {
            if (value >= min) return true;
            throw `longer than ${min}`;
        } else if (max) {
            if (value <= max) return true;
            throw `shorter than ${max}`;
        }
        return null;
    }

};
