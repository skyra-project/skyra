const { Role: fetchRole, Channel: fetchChannel } = require("../../functions/search");
const Schema = require("../../functions/schema");

const object = Schema.find();

const dot = value => `${value ? "  \\🔹" : "  \\🔸"} `;

class Validator {
    constructor(guild) {
        this.guild = guild;
        this.guildSettings = guild.settings;
    }

    get list() {
        const configs = this.guildSettings;
        return [
            "**❯ Channels**",
            ` • **Announcement:** ${configs.channels.announcement ? this.guild.channels.get(configs.channels.announcement) || configs.channels.announcement : "Not set"}`,
            ` • **Default:** ${configs.channels.default ? this.guild.channels.get(configs.channels.default) || configs.channels.default : "Not set"}`,
            ` • **Log:** ${configs.channels.log ? this.guild.channels.get(configs.channels.log) || configs.channels.log : "Not set"}`,
            ` • **MODLog:** ${configs.channels.mod ? this.guild.channels.get(configs.channels.mod) || configs.channels.mod : "Not set"}`,
            ` • **Spam:** ${configs.channels.spam ? this.guild.channels.get(configs.channels.spam) || configs.channels.spam : "Not set"}`,
            "",
            "**❯ Roles**",
            ` • **Admin:** ${configs.roles.admin ? this.guild.roles.get(configs.roles.admin) || configs.roles.admin : "Not set"}`,
            ` • **Moderator:** ${configs.roles.moderator ? this.guild.roles.get(configs.roles.moderator) || configs.roles.moderator : "Not set"}`,
            ` • **Staff:** ${configs.roles.staff ? this.guild.roles.get(configs.roles.staff) || configs.roles.staff : "Not set"}`,
            ` • **Muted:** ${configs.roles.muted ? this.guild.roles.get(configs.roles.muted) || configs.roles.muted : "Not set"}`,
            "",
            "**❯ Events**",
            `${dot(configs.events.channelCreate)}**channelCreate**`,
            `${dot(configs.events.guildBanAdd)}**guildBanAdd**`,
            `${dot(configs.events.guildBanRemove)}**guildBanRemove**`,
            `${dot(configs.events.guildMemberAdd)}**guildMemberAdd**`,
            `${dot(configs.events.guildMemberRemove)}**guildMemberRemove**`,
            `${dot(configs.events.guildMemberUpdate)}**guildMemberUpdate**`,
            `${dot(configs.events.messageDelete)}**messageDelete**`,
            `${dot(configs.events.messageDeleteBulk)}**messageDeleteBulk**`,
            `${dot(configs.events.messageUpdate)}**messageUpdate**`,
            `${dot(configs.events.roleUpdate)}**roleUpdate**`,
            `${dot(configs.events.commands)}**commands**`,
            `${dot(configs.events.modLogProtection)}**modLogProtection**`,
            "",
            "**❯ Messages**",
            `${dot(configs.messages.farewell)}**Farewell**`,
            `${dot(configs.messages.greeting)}**Greeting**`,
            ` • **FarewellMessage:** ${configs.messages.farewellMessage || "Not set"}`,
            ` • **GreetingMessage:** ${configs.messages.greetingMessage || "Not set"}`,
            "",
            "**❯ Master**",
            ` • **Prefix:** ${configs.prefix || "&"}`,
            ` • **Mode:** ${configs.mode || 0}`,
            "",
            "**❯ SelfMOD**",
            `${dot(configs.selfmod.inviteLinks)}**Invite Links**`,
            `${dot(configs.selfmod.ghostmention)}**Ghost Mention**`,
        ].join("\n");
    }

    async handle(type, folder, subfolder, input) {
        if (type === "update") {
            const inputType = object[folder][subfolder].type;
            if (!input) throw `You must provide a value type: ${inputType}`;
            const output = await this.update(folder, subfolder, input, inputType);
            return `Success. Changed value **${subfolder}** to **${output}**`;
        }

        const val = object[folder][subfolder];
        const validation = Schema.find(val.default)[folder][subfolder];
        await this.guild.settings.update(validation.path);
        return `Success. Value **${subfolder}** has been reset to **${val.default}**`;
    }

    async update(folder, subfolder, input, inputType) {
        const parsed = await this.parse(inputType, input);
        const validator = Schema.find(parsed.id || parsed)[folder][subfolder];
        await this.guild.settings.update(validator.path);
        return parsed.name || parsed;
    }

    async parse(type, input) {
        switch (type) {
            case "Boolean": {
                if (/^(true|1|\+)$/.test(input.toLowerCase())) return true;
                else if (/^(false|0|-)$/.test(input.toLowerCase())) return false;
                throw "I expect a Boolean. (true|1|+)/(false|0|-)";
            }
            case "String": {
                return String(input);
            }
            case "Role": {
                const role = await fetchRole(input.toLowerCase(), this.guild);
                if (role) return role;
                throw "I expect a Role.";
            }
            case "TextChannel": {
                const channel = await fetchChannel(input.toLowerCase(), this.guild);
                if (channel) return channel;
                throw "I expect a Channel.";
            }
            default:
                throw `Unknown Type: ${type}`;
        }
    }
}

exports.run = async (client, msg, [type, folder, subfolder, ...input]) => {
    input = input.join(" ");
    const run = new Validator(msg.guild);
    if (type === "list") {
        const data = run.list;
        const embed = new client.methods.Embed()
            .setColor(msg.color)
            .setTitle(`Configuration for: ${msg.guild.name}`)
            .setDescription(data)
            .setFooter("Skyra Configuration System")
            .setTimestamp();

        return msg.send({ embed });
    }
    if (!folder) throw "Choose between Channels, Roles, Events, Messages, Master, Selfmod";
    const possibilities = Object.keys(object[folder]);
    if (!possibilities.includes(subfolder)) throw `Choose between one of the following: ${possibilities.join(", ")}`;
    const response = await run.handle(type, folder, subfolder, input);
    return msg.alert(response || "Success!", 10000);
};

exports.conf = {
    enabled: true,
    runIn: ["text"],
    aliases: [],
    permLevel: 3,
    botPerms: [],
    requiredFuncs: [],
    spam: false,
    mode: 2,
    cooldown: 3,
};

exports.help = {
    name: "config",
    description: "",
    usage: "<update|reset|list> [channels|roles|events|messages|master|selfmod] [key:string] [value:string] [...]",
    usageDelim: " ",
    extendedHelp: "",
};
