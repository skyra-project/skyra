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
                settings.autoroles.sort((x, y) => +(x.points > y.points) || +(x.points === y.points) - 1);
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
                settings.autoroles.sort((x, y) => +(x.points > y.points) || +(x.points === y.points) - 1);
                return msg.send(`Updated autorole: ${role.name} (${role.id}). Points required: ${amount} (before: ${retrieved.points})`);
            }
            case 'setting': return this.settingHandler(msg, input, settings);
            default: throw new Error(`unknown action: ${action}`);
        }
    }

    parse(data) {
        const args = data.split(' ');
        if (!['list', 'add', 'remove', 'update'].includes(args[0])) throw 'Missing a required option: (list, add, remove, setting)';
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
