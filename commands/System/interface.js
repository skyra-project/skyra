const { Command } = require('../../index');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            guildOnly: true,
            permLevel: 3,
            mode: 2,

            description: 'Start the Configuration Prompt Interface'
        });

        this.schema = this.client.settingGateway.schema;
        this.folders = Object.keys(this.schema);

        this._promptOptions = { time: 30000, max: 1, errors: ['time'] };
    }

    async run(msg, params, settings, i18n) {
        return this.await([], msg, i18n).catch(err => {
            if (Array.isArray(err)) throw i18n.get(...err);
            throw err;
        });
    }

    async await(location, msg, i18n) {
        const message = location.length === 0 ?
            `Choose one of the following groups: \`${this.folders.join('`, `')}\`\n\nOr write **abort**/**exit** to __exit__ the system.` :
            `Choose one of the following keys: \`${Object.keys(this.schema[location[0]]).join('`, `')}\` \n\nOr write **abort**/**exit** to __exit__ the system, **previous**/**back** to go one folder back (to the main menu).`;
        const reply = await this.getMessage(msg, message);
        if (/^(abort|exit)$/.test(reply)) return this.abort();
        if (/^(prev(ious)?|back)$/.test(reply)) return this.back(location, msg, i18n);
        return this.next(reply, location, msg, i18n);
    }

    async getMessage(msg, content) {
        await msg.send(content);
        const messages = await msg.channel.awaitMessages(message => message.author.id === msg.author.id, this._promptOptions)
            .catch(() => this.abort('TIME'));
        const message = messages.first();
        if (message.deletable) await message.nuke().catch(() => null);
        return message.content.toLowerCase();
    }

    next(path, location, ...args) {
        switch (location.length) {
            case 0: {
                if (this.folders.includes(path)) location[0] = path;
                return this.await(location, ...args);
            }
            case 1: {
                const group = this.schema[location[0]];
                if (path in group) location[1] = path;
                return this.manage(group[path], location, ...args);
            }
            default:
                return null;
        }
    }

    back(location, ...args) {
        if (location.length > 0) {
            location = location.slice(0, location.length - 1);
        }
        return this.await(location, ...args);
    }

    async manage(schema, location, msg, i18n, message = null) {
        const settings = msg.guild.settings;
        const reply = await this.getMessage(msg, `${message !== null ? `__${message}__\n` : ''}${[
            `**Description**: *${schema.description}*`,
            `**Value**: \`${this.handle(settings[location[0]][location[1]])}\`\n`,
            'Write **-edit** for key __editing__, **-reset** for key __reseting__, **-add** for key __adding__ or **-remove** for key __removing__.'
        ].join('\n')}`);
        if (/^(abort|exit)$/.test(reply)) return this.abort();
        if (/^(prev(ious)?|back)$/.test(reply)) return this.back(location, msg, i18n);
        if (/^-?e(dit)?$/.test(reply)) message = await this.edit(schema, location, msg, i18n);
        else if (/^-?r(eset)?$/.test(reply)) message = await this.reset(location, msg, i18n);
        else if (/^-?add$/.test(reply)) message = await this.add(schema, location, msg, i18n);
        else if (/^-?remove$/.test(reply)) message = await this.remove(schema, location, msg, i18n);
        else message = 'Unknown action.';
        return this.manage(schema, location, msg, i18n, message);
    }

    async edit(schema, [group, key], msg, i18n) {
        if (schema.array) return this.add(schema, [group, key], msg, i18n);
        const input = await this.getMessage(msg, 'Input a new value for this key.');
        return this.client.settingGateway.update(msg.guild, { [group]: { [key]: input } })
            .then(response => i18n.get('COMMAND_CONF_UPDATED', `${group}**::**${key} `, response[group][key]))
            .catch(error => error);
    }

    async add(schema, [group, key], msg, i18n) {
        if (schema.array !== true) return i18n.get('COMMAND_CONF_KEY_NOT_ARRAY');
        const current = this.handle(msg.guild.settings[group][key]);
        const input = await this.getMessage(msg, `Input a value to add to this key.\n**Current**: ${current}`);
        return this.client.settingGateway.updateArray(msg.guild, 'add', group, key, input)
            .then(() => i18n.get('COMMAND_CONF_ADDED', input, `${group}**::**${key} `))
            .catch(error => error);
    }

    async remove(schema, [group, key], msg, i18n) {
        if (schema.array !== true) return i18n.get('COMMAND_CONF_KEY_NOT_ARRAY');
        const current = this.handle(msg.guild.settings[group][key]);
        const input = await this.getMessage(msg, `Input a value to add to this key.\n**Current**: ${current}`);
        return this.client.settingGateway.updateArray(msg.guild, 'remove', group, key, input)
            .then(() => i18n.get('COMMAND_CONF_REMOVE', input, `${group}**::**${key} `))
            .catch(error => error);
    }

    reset([group, key], msg, i18n) {
        return this.client.settingGateway.reset(msg.guild, group, key)
            .then(response => i18n.get('COMMAND_CONF_RESET', `${group}**::**${key} `, response))
            .catch(error => error);
    }

    abort(reason = null) {
        throw ['COMMAND_CONFIGURATION_ABORT', reason];
    }

    handle(value) {
        if (typeof value !== 'object') return value;
        if (value === null) return 'Not set';
        if (Array.isArray(value)) return value.length > 0 ? `[ ${value.join(' | ')} ]` : 'None';
        return value;
    }

};
