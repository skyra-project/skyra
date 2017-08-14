const { Command } = require('../../index');
const Rethink = require('../../providers/rethink');

/* eslint-disable max-len */
module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['autoroles', 'levelrole', 'lvlrole'],
            guildOnly: true,
            permLevel: 3,
            mode: 2,
            cooldown: 10,

            usage: '<input:string>',
            usageDelim: ' ',
            description: '(ADM) List or configure the autoroles for a guild.',
            extendedHelp: Command.strip`
                Autoroles? They are roles that are available for everyone, and automatically given when they reach an amound of (local) points, an administrator must configure them throught a setting command.

                = Usage =
                Skyra, autorole list                :: I will show you all the autoroles.
                Skyra, autorole add <amount> <role> :: Add a new autorole.
                Skyra, autorole remove <role>       :: Remove an autorole from the list.
                Skyra, autorole update <role>       :: Changed the required amount of points for an existing autorole.

                = Reminder =
                The current system grants a random amount of points between 4 and 8 points, for each post with a 1 minute cooldown.

                = Setting|ignoreChannels Usage =
                The ignoreChannel list is a list of channels Skyra doesn't listen when giving points.
                Skyra, autorole setting ignorechannels list <channel>   :: Get a list of all channels from the ignoreChannels list.
                Skyra, autorole setting ignorechannels add <channel>    :: Add channels to the ignoreChannels list.
                Skyra, autorole setting ignorechannels remove <channel> :: Remove channels to the ignoreChannels list.

                = Setting|initialRole Usage =
                The initialRole role is a role that Skyra will assign automatically to all new members.
                Skyra, autorole setting initialrole get           :: Check what is the current initial role.
                Skyra, autorole setting initialrole set <role>    :: Set the initial role.
                Skyra, autorole setting initialrole remove <role> :: Remove the initial role.

                = Examples =
                • Skyra, autorole add 20000 Trusted Member
                    I'll start auto-assigning the role 'Trusted Member' to anyone who has at least 20.000 points (based on local points).
            `
        });
    }

    async run(msg, [data], settings) {
        const [action, amount, input] = this.parse(data);
        switch (action) {
            case 'list': {
                if (!settings.autoroles.length) throw 'there are no autoroles configured for this guild.';
                return msg.send(settings.autoroles.map((obj) => {
                    const role = msg.guild.roles.get(obj.id);
                    return role ? `${role.name} (${role.id}):: ${obj.points}` : `Unknown role${obj.id}`;
                }).join('\n'), { code: 'asciidoc' });
            }
            case 'add': {
                if (!amount) throw 'you must assign an amount of points for the new autorole.';
                if (!input[0]) throw 'you must type a role.';
                const role = await this.client.handler.search.role(input.join(' '), msg);
                if (!role) throw 'this role does not exist.';
                await Rethink.append('guilds', msg.guild.id, 'autoroles', { id: role.id, points: amount });
                await settings.sync();
                return msg.send(`Added new autorole: ${role.name} (${role.id}). Points required: ${amount}`);
            }
            case 'remove': {
                if (!input[0]) throw 'you must type a role.';
                const isSnowflake = /\d{17,19}/.test(input.join(' '));
                const role = await this.client.handler.search.role(input.join(' '), msg)
                    .catch(() => isSnowflake ? { name: 'Unknown', id: input.join(' ') } : null);
                if (!role) throw 'this role does not exist.';
                const retrieved = settings.autoroles.find(ar => ar.id === role.id);
                if (!retrieved) throw 'this role is not configured as an autorole.';
                else {
                    await Rethink.removeFromArrayByID('guilds', msg.guild.id, 'autoroles', role.id);
                    await settings.sync();
                    return msg.send(`Removed the autorole: ${role.name} (${role.id}), which required ${retrieved.points} points.`);
                }
            }
            case 'update': {
                if (!amount) throw 'you must assign an amount of points for the new autorole.';
                if (!input[0]) throw 'you must type a role.';
                const role = await this.client.handler.search.role(input.join(' '), msg);
                if (!role) throw 'this role does not exist.';
                const retrieved = settings.autoroles.find(ar => ar.id === role.id);
                if (!retrieved) throw 'this role is not configured as an autorole.';
                await Rethink.updateArrayByID('guilds', msg.guild.id, 'autoroles', role.id, { points: amount });
                await settings.sync();
                return msg.send(`Updated autorole: ${role.name} (${role.id}). Points required: ${amount} (before: ${retrieved.points})`);
            }
            case 'setting': return this.settingHandler(msg, input, settings);
            default: throw new Error(`unknown action: ${action}`);
        }
    }

    async settingHandler(msg, [type, action, ...value], settings) {
        if (!type || !['initialrole', 'ignorechannels'].includes(type.toLowerCase())) throw 'you must select one of the following settings: `initialRole`|`ignoreChannels`';
        switch (type.toLowerCase()) {
            case 'initialrole': {
                if (!action || !['get', 'set', 'remove'].includes(action.toLowerCase())) throw 'you must select one of the following actions: `set`|`remove`';
                if (action.toLowerCase() === 'get') {
                    const initialRole = settings.initialRole;
                    return msg.send(initialRole ? `Current initial role: ${msg.guild.roles.get(initialRole).name}` : 'No initial role set.');
                } else if (action.toLowerCase() === 'set') {
                    if (!value[0]) throw 'you must specify a Role.';
                    const role = await this.client.handler.search.role(value.join(' '), msg);
                    await settings.update({ initialRole: role.id });
                    return msg.send(`✅ Success | New **initialRole** set to ${role.name}.`);
                }
                await settings.update({ initialRole: null });
                return msg.send('✅ Success | Removed the value for **initialRole**.');
            }
            case 'ignorechannels': {
                if (!action || !['list', 'add', 'remove'].includes(action.toLowerCase())) throw 'you must select one of the following actions: `add`|`remove`';
                if (action.toLowerCase() === 'list') {
                    if (!settings.ignoreChannels.length) throw 'there are no autoroles configured for this guild.';
                    return msg.send(settings.ignoreChannels.map((ch) => {
                        const channel = msg.guild.channels.get(ch);
                        return channel ? `${channel.name} (${channel.id})` : `Unknown channel: ${ch}`;
                    }).join('\n'), { code: true });
                }
                if (!value[0]) throw 'you must specify a Channel.';
                const channel = await this.client.handler.search.channel(value.join(' '), msg);
                const ignoreChannels = settings.ignoreChannels;
                if (action.toLowerCase() === 'add') {
                    if (ignoreChannels.includes(channel.id)) throw 'this channel is already ignored.';
                    await Rethink.append('guilds', msg.guild.id, 'ignoreChannels', channel.id);
                    await settings.sync();
                    return msg.send(`✅ Success | Now I won't give points in the channel ${channel.name}.`);
                }
                if (!ignoreChannels.length) throw 'this server does not have an ignored channel';
                if (!ignoreChannels.includes(channel.id)) throw 'this channel is not ignored.';
                await settings.update({ ignoreChannels: ignoreChannels.filter(ch => ch !== channel.id) });
                return msg.send(`✅ Success | Now I'll listen the channel ${channel.name}.`);
            }
            default: throw new Error(`Unknown type: ${action}`);
        }
    }

    parse(data) {
        const args = data.split(' ');
        if (!['list', 'add', 'remove', 'update', 'setting'].includes(args[0])) throw 'Missing a required option: (list, add, remove, setting)';
        const action = args[0];
        args.shift();
        let amount;
        if (/\d{1,7}/.test(args[0])) {
            amount = parseInt(args[0]);
            args.shift();
        }
        const input = args;

        return [action, amount, input];
    }

};
