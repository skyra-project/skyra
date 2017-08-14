const { Command } = require('../../index');

/* eslint-disable class-methods-use-this */
module.exports = class Configuration extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['conf', 'config'],
            guildOnly: true,
            permLevel: 3,
            mode: 2,

            usage: '<set|get|reset|list|remove> <group:string> [key:string] [value:string] [...]',
            usageDelim: ' ',
            description: 'Modify the Server configuration.'
        });
    }

    async run(msg, [type, group, key, ...input], settings) {
        input = input.length > 0 ? input.join(' ') : 0;
        const Schema = this.client.settingGateway.schema;

        const possibilities = Object.keys(Schema);
        if (!possibilities.includes(group)) throw `Choose between one of the following: ${possibilities.join(', ')}`;
        if (type !== 'list' && (!key || key in Schema[group] === false)) throw `Choose between one of the following: ${Object.keys(Schema[group])}`;

        return this[type](msg, group, key, input, settings);
    }

    async set(msg, group, key, input) {
        const schema = this.client.settingGateway.schema[group][key];
        if (schema.array) {
            await this.client.settingGateway.updateArray(msg.guild, 'add', group, key, input);
            return msg.send(msg.language.get('COMMAND_CONF_ADDED', input, `${group}::${key}`));
        }
        const response = await this.client.settingGateway.update(msg.guild, { [key]: { [group]: input } });
        return msg.send(msg.language.get('COMMAND_CONF_UPDATED', `${group}::${key}`, response));
    }

    get(msg, group, key, input, settings) {
        return msg.send(msg.language.get('COMMAND_CONF_GET', `${group}::${key}`, this.handle(settings[group][key])));
    }

    reset(msg, group, key) {
        return this.client.settingGateway.reset(msg.guild, group, key)
            .then(response => msg.send(msg.language.get('COMMAND_CONF_RESET', `${group}::${key}`, response)));
    }

    list(msg, group, key, input, settings) {
        const schema = this.client.settingGateway.schema[group];

        const longest = Object.keys(schema).sort((a, b) => a.length < b.length)[0].length;
        const output = [`= Settings::${group} =`];

        for (const [sKey, value] of Object.entries(settings[group])) {
            output.push(`${sKey.padEnd(longest)} :: ${this.handle(value)}`);
        }
        return msg.send(output.join('\n'), { code: 'asciidoc' });
    }

    remove(msg, group, key, input) {
        if (this.client.settingGateway.schema[group][key].array !== true) return msg.send(msg.language.get('COMMAND_CONF_KEY_NOT_ARRAY'));
        return this.client.settingGateway.updateArray(msg.guild, 'remove', group, key, input)
            .then(() => msg.send(msg.language.get('COMMAND_CONF_REMOVE', input, `${group}::${key}`)))
            .catch(err => msg.send(err));
    }

    handle(value) {
        if (typeof value !== 'object') return value;
        if (value === null) return 'Not set';
        if (Array.isArray(value)) return value.length > 0 ? `[ ${value.join(' | ')} ]` : 'None';
        return value;
    }

};
