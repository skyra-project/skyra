const { Command } = require('../../index');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['conf', 'config'],
            guildOnly: true,
            permLevel: 3,
            mode: 2,
            cooldown: 5,

            usage: '<set|get|reset|list|remove> <group:string> [key:string] [value:string] [...]',
            usageDelim: ' ',
            description: 'Modify the Server configuration.'
        });
    }

    async run(msg, [type, group, key, ...input], settings, i18n) {
        input = input.length > 0 ? input.join(' ') : 0;
        const Schema = this.client.settingGateway.schema;

        const possibilities = Object.keys(Schema);
        if (!possibilities.includes(group))
            throw i18n.get('COMMAND_CONF_SELECTKEY', possibilities.join(', '));
        if (type !== 'list' && (!key || key in Schema[group] === false))
            throw i18n.get('COMMAND_CONF_SELECTKEY', Object.keys(Schema[group]).join(', '));

        return this[type](msg, group, key, input, settings, i18n);
    }

    async set(msg, group, key, input, settings, i18n) {
        const schema = this.client.settingGateway.schema[group][key];
        if (schema.array) {
            await this.client.settingGateway.updateArray(msg.guild, 'add', group, key, input)
                .catch(error => { throw Array.isArray(error) ? i18n.get(...error) : error; });
            return msg.send(i18n.get('COMMAND_CONF_ADDED', group, key, input));
        }
        const response = await this.client.settingGateway.update(msg.guild, { [group]: { [key]: input } })
            .catch(error => { throw Array.isArray(error) ? i18n.get(...error) : error; });
        return msg.send(i18n.get('COMMAND_CONF_UPDATED', group, key, response[group][key]));
    }

    get(msg, group, key, input, settings, i18n) {
        return msg.send(i18n.get('COMMAND_CONF_GET', group, key, this.handle(settings[group][key])));
    }

    reset(msg, group, key, input, settings, i18n) {
        return this.client.settingGateway.reset(msg.guild, group, key)
            .then(response => msg.send(i18n.get('COMMAND_CONF_RESET', group, key, response)))
            .catch(error => { throw Array.isArray(error) ? i18n.get(...error) : error; });
    }

    list(msg, group, key, input, settings) {
        const schema = this.client.settingGateway.schema[group];

        const longest = Object.keys(schema).sort((a, b) => a.length < b.length)[0].length;
        const output = [`= Settings::${group} =`];

        for (const sKey of Object.keys(schema))
            output.push(`${sKey.padEnd(longest)} :: ${this.handle(settings[group][sKey])}`);

        return msg.send(output.join('\n'), { code: 'asciidoc' });
    }

    remove(msg, group, key, input, settings, i18n) {
        if (this.client.settingGateway.schema[group][key].array !== true) return msg.send(i18n.get('COMMAND_CONF_KEY_NOT_ARRAY'));
        return this.client.settingGateway.updateArray(msg.guild, 'remove', group, key, input)
            .then(() => msg.send(i18n.get('COMMAND_CONF_REMOVE', group, key, input)))
            .catch(error => { throw Array.isArray(error) ? i18n.get(...error) : error; });
    }

    handle(value) {
        if (typeof value !== 'object') return value;
        if (value === null) return 'Not set';
        if (Array.isArray(value)) return value.length > 0 ? `[ ${value.join(' | ')} ]` : 'None';
        return value;
    }

};
