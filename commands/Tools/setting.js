const { Command } = require('../../index');
const Rethink = require('../../providers/rethink');

/* eslint-disable class-methods-use-this */
module.exports = class Settings extends Command {

    constructor(...args) {
        super(...args, 'setting', {
            permLevel: 3,
            mode: 2,

            usage: '<add|remove|reset> <commands|publicroles|ignorecmdchannel> [value:string]',
            usageDelim: ' ',
            description: 'Edit the way Skyra works.',
            extendedHelp: Command.strip`
                This command is made for some extra stuff that defines how Skyra should work in your server.
                
                Types:
                Add    :: Will add a new value to the configs.
                Remove :: Will remove a value from the configs.
                Reset  :: Will reset a key.
                
                Keys:
                Commands         :: This key defines which commands you want to disable from the server.
                    For example, disabling the ping command will make everyone unable to use it.
                IgnoreCMDChannel :: This key defines which channels you want Skyra to ignore from the server, monitors will be run, commands won't.
                    For example, disabling the general channel will make everyone unable to use commands there.
                PublicRoles      :: This key defines which roles should be 'claimable' throught Skyra.
                    For example, adding the role 'Member' will make everyone able to use it by using '&claim Member'.
                WordFilter       :: This key defines which words you want Skyra to control from all the channels she can read in.
                    For example, adding a swearword will make Skyra control them, and perform the action you configured her for.
            `
        });
    }

    async run(msg, [type, key, value = null]) {
        await msg.guild.settings.ensureConfigs();
        const response = await this[type](msg, key, value);
        return msg.alert(response);
    }

    async add(msg, key, value) {
        if (!value) throw 'you must assign a value to add.';
        const nValue = await this.parse(msg, key, value);
        const { path } = this.validator[key];
        if (msg.guild.settings[path].includes(nValue.id || nValue)) throw `the value ${value} is already set.`;
        await Rethink.append('guilds', msg.guild.id, path, nValue.id || nValue);
        await msg.guild.settings.sync();
        return `Successfully added the value **${nValue.name || nValue}** to the key **${key}**`;
    }

    async remove(msg, key, value) {
        if (!value) throw 'you must assign a value to remove.';
        const nValue = await this.parse(msg, key, value);
        const { path } = this.validator[key];
        if (!msg.guild.settings[path].includes(nValue.id || nValue)) throw `the value ${value} does not exist in the configuration.`;
        await msg.guild.settings.update({ [path]: msg.guild.settings[path].filter(entry => entry !== (nValue.id || nValue)) });
        return `Successfully removed the value **${nValue.name || nValue}** from the key **${key}**`;
    }

    async reset(msg, key) {
        const { path } = this.validator[key];
        await msg.guild.settings.update({ [path]: [] });
        return `The key **${path} has been reset.`;
    }

    async parse(msg, key, value) {
        return this.validator[key].check(msg, value);
    }

    get validator() {
        return {
            commands: {
                type: 'Command',
                path: 'disabledCommands',
                check: (msg, value) => {
                    value = value.toLowerCase();
                    const cmd = msg.client.commands.get(value) || msg.client.commands.get(msg.client.aliases.get(value));
                    const commands = this.commands.filter(command => command.conf.protected === true);
                    if (!cmd) throw `${value} is not a command.`;
                    if (cmd && !commands.has(cmd.help.name)) throw `you can't disable the command ${cmd.help.name}, it's protected.`;
                    return cmd;
                }
            },
            ignorecmdchannel: {
                type: 'Channel',
                path: 'disabledCmdChannels',
                check: (msg, value) => {
                    value = value.toLowerCase();
                    if (value === 'here') return msg.channel;
                    return this.client.handler.search.channel(value, msg);
                }
            },
            publicroles: {
                type: 'Role',
                path: 'publicRoles',
                check: (msg, value) => {
                    value = value.toLowerCase();
                    return this.client.handler.search.role(value, msg);
                }
            },
            wordfilter: {
                type: 'String',
                path: 'profanity',
                check: (msg, value) => value
            }
        };
    }

};
