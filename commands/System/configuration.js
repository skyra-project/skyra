const { Command } = require('../../index');
const Schema = require('../../functions/schema');

const SchemaProps = Schema.find();

/* eslint-disable class-methods-use-this */
module.exports = class Configuration extends Command {

    constructor(...args) {
        super(...args, 'configuration', {
            aliases: ['conf', 'config'],
            guildOnly: true,
            permLevel: 3,
            mode: 2,

            usage: '<update|reset|list> [channels|roles|events|messages|master|selfmod|filter] [key:string] [value:string] [...]',
            usageDelim: ' ',
            description: 'Modify the Server configuration.'
        });
    }

    async run(msg, [type, folder, subfolder, ...input]) {
        input = input.join(' ');
        if (!folder) throw 'Choose between Channels, Roles, Events, Messages, Master, Selfmod';
        const possibilities = Object.keys(SchemaProps[folder]);
        if (!possibilities.includes(subfolder)) throw `Choose between one of the following: ${possibilities.join(', ')}`;
        if (type === 'list') {
            const data = this.list(msg, folder);
            return msg.send(data.join('\n'), { code: 'asciidoc' });
        }
        const response = await this.handle(msg, type, folder, subfolder, input);
        return msg.alert(response || 'Success!', 10000);
    }

    async handle(msg, type, folder, subfolder, input) {
        if (type === 'update') {
            const inputType = SchemaProps[folder][subfolder].type;
            if (!input) throw `You must provide a value type: ${inputType}`;
            const output = await this.update(msg, folder, subfolder, input, inputType);
            return `Success. Changed value **${subfolder}** to **${output}**`;
        }

        const val = SchemaProps[folder][subfolder];
        const validation = Schema.find(val.default)[folder][subfolder];
        await msg.guild.settings.update(validation.path);
        return `Success. Value **${subfolder}** has been reset to **${val.default}**`;
    }

    async update(msg, folder, subfolder, input, inputType) {
        const parsed = await this.parse(msg, inputType, input);
        const validator = Schema.find(parsed.id || parsed)[folder][subfolder];
        await msg.guild.settings.update(validator.path);
        return parsed.name || parsed;
    }

    async parse(msg, type, input) {
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
                const role = await this.client.handler.search.role(input, msg);
                if (role) return role;
                throw 'I expect a Role.';
            }
            case 'TextChannel': {
                const channel = await this.client.handler.search.channel(input, msg);
                if (channel) {
                    if (channel.type !== 'text') throw 'This is not a text channel.';
                    return channel;
                }
                throw 'I expect a Channel.';
            }
            case 'Number': {
                const number = parseInt(input);
                if (isNaN(number)) throw 'I expect a Number.';
                return number;
            }
            default:
                throw `Unknown Type: ${type}`;
        }
    }

    list(msg, folder) {
        const folderSettings = folder !== 'master' ? msg.guild.settings[folder] : msg.guild.settings;
        const keys = Object.keys(SchemaProps[folder]);
        const longest = keys.reduce((long, str) => Math.max(long, str.length), 0);
        const output = [];
        let i = 0;
        for (const key of keys) {
            output[i++] = `${String(key).padEnd(longest, ' ')} ${Configuration.show(SchemaProps[folder].type, msg.guild, folderSettings[key])}`;
        }

        return output;
    }

    static show(type, guild, setting) {
        switch (type) {
            case 'Role': return setting ? guild.roles.get(setting) || setting : 'Not set';
            case 'TextChannel': return setting ? guild.channels.get(setting) || setting : 'Not set';
            case 'Boolean': return !!setting;
            case 'Number': return setting;
            default: return setting;
        }
    }

};
