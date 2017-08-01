const { Role: fetchRole, Channel: fetchChannel } = require('./search');

/* eslint-disable class-methods-use-this */
module.exports = class SettingResolver {

    constructor(client) {
        this.client = client;
    }

    validate(guild, schema, input) {
        return this.parse(guild, schema.type, input)
            .then((data) => {
                if (schema.min || schema.max) SettingResolver.maxOrMin(input, schema.min, schema.max);
                return data;
            })
            .catch((err) => { throw err; });
    }

    async parse(guild, type, input) {
        switch (type) {
            case 'Boolean': {
                if (/^(true|1|\+)$/.test(input.toLowerCase())) return true;
                else if (/^(false|0|-)$/.test(input.toLowerCase())) return false;
                throw 'I expect a Boolean. (true|1|+)/(false|0|-)';
            }
            case 'String': {
                return String(input);
            }
            case 'Role': {
                const role = await fetchRole(input.toLowerCase(), guild);
                if (role) return role.id;
                throw 'I expect a Role.';
            }
            case 'TextChannel': {
                const channel = await fetchChannel(input.toLowerCase(), guild);
                if (channel) return channel.id;
                throw 'I expect a Channel.';
            }
            case 'Float':
            case 'Number': {
                const number = parseFloat(input);
                if (isNaN(number)) throw 'I expect a Number.';
                return number;
            }
            case 'Integer': {
                const number = parseInt(input);
                if (isNaN(number)) throw 'I expect a Number.';
                return number;
            }
            default:
                throw `Unknown Type: ${type}`;
        }
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
