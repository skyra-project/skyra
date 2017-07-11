const { Role: fetchRole, Channel: fetchChannel } = require("../../functions/search");
const Rethink = require("../../providers/rethink");

/* eslint-disable no-use-before-define */
class Settings {

    constructor(msg) {
        Object.defineProperty(this, "msg", { value: msg });
        Object.defineProperty(this, "guild", { value: msg.guild });
        Object.defineProperty(this, "configs", { value: msg.guild.settings });
        Object.defineProperty(this, "client", { value: msg.client });
    }

    async parse(key, value) {
        const type = validator[key].type;
        switch (type) {
            case "String": return value;
            case "Role": {
                value = value.toLowerCase();
                return fetchRole(value, this.guild);
            }
            case "Channel": {
                value = value.toLowerCase();
                if (value === "here") return this.msg.channel;
                return fetchChannel(value, this.guild);
            }
            case "Command": {
                value = value.toLowerCase();
                if (["setting"].includes(value)) throw `you can't disable the command ${value}, it's protected.`;
                const commands = this.client.commands.filter(cmd => cmd.conf.permLevel < 10);
                if (commands.has(value)) return value;
                const alias = this.client.aliases.get(value);
                if (alias) {
                    const command = commands.get(alias);
                    if (command) return command;
                }
                throw `${value} is not a command.`;
            }
            default:
                throw `unknown Type: ${type}`;
        }
    }

    async handle(type, key, value) {
        switch (type) {
            case "add": {
                if (!value) throw "you must assign a value to add.";
                const nValue = await this.parse(key, value);
                const { path } = validator[key];
                if (this.guild.settings[path].includes(nValue.id || nValue)) throw `the value ${value} is already set.`;
                await Rethink.append("guilds", this.guild.id, path, nValue.id || nValue);
                await this.guild.settings.sync();
                return `Successfully added the value **${nValue.name || nValue}** to the key **${key}**`;
            }
            case "remove": {
                if (!value) throw "you must assign a value to remove.";
                const nValue = await this.parse(key, value);
                const { path } = validator[key];
                if (!this.guild.settings[path].includes(nValue.id || nValue)) throw `the value ${value} does not exist in the configuration.`;
                await this.guild.settings.update({ [path]: this.guild.settings[path].filter(v => v !== (nValue.id || nValue)) });
                return `Successfully removed the value **${nValue.name || nValue}** from the key **${key}**`;
            }
            case "reset": {
                const { path } = validator[key];
                await this.guild.settings.update({ [path]: [] });
                return `The key **${path} has been reset.`;
            }
            default:
                throw `unknown Type: ${type}`;
        }
    }

}

exports.run = async (client, msg, [type, key, value = null]) => {
    const settings = new Settings(msg);
    await msg.guild.settings.ensureConfigs();
    const response = await settings.handle(type, key, value);
    return msg.alert(response);
};

exports.conf = {
    enabled: true,
    runIn: ["text"],
    aliases: [],
    permLevel: 3,
    botPerms: [],
    requiredFuncs: [],
    spam: false,
    mode: 1,
    cooldown: 3,
};

exports.help = {
    name: "setting",
    description: "Edit the way Skyra works.",
    usage: "<add|remove|reset> <commands|publicroles|ignorecmdchannel> [value:string]",
    usageDelim: " ",
    extendedHelp: [
        "This command is made for some extra stuff that defines how Skyra should work in your server.",
        "",
        "Types:",
        "Add :: Will add a new value to the configs.",
        "Remove :: Will remove a value from the configs.",
        "Reset :: Will reset a key.",
        "",
        "Keys:",
        "Commands :: This key defines which commands you want to disable from the server.",
        "  For example, disabling the ping command will make everyone unable to use it.",
        "IgnoreCMDChannel :: This key defines which channels you want Skyra to ignore from the server, monitors will be run, commands won't.",
        "  For example, disabling the general channel will make everyone unable to use commands there.",
        "PublicRoles :: This key defines which roles should be 'claimable' throught Skyra.",
        "  For example, adding the role 'Member' will make everyone able to use it by using '&claim Member'.",
        "WordFilter :: This key defines which words you want Skyra to control from all the channels she can read in.",
        "  For example, adding a swearword will make Skyra control them, and perform the action you configured her for.",
    ].join("\n"),
};

const validator = {
    commands: {
        type: "Command",
        path: "disabledCommands",
    },
    ignorecmdchannel: {
        type: "Channel",
        path: "disabledCmdChannels",
    },
    publicroles: {
        type: "Role",
        path: "publicRoles",
    },
    wordfilter: {
        type: "String",
        path: "profanity",
    },
};
