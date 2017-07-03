const { Role: fetchRole, Channel: fetchChannel, User: fetchUser } = require("../../functions/search");
const toTitleCase = require("../../functions/toTitleCase");
const { Permissions } = require("discord.js");
const moment = require("moment");

const PermissionFlags = Object.keys(Permissions.FLAGS);

/* eslint-disable no-use-before-define */
const Run = class Run {
    constructor(msg) {
        this.msg = msg;
        this.guild = msg.guild;
        this.channel = msg.channel;
        this.client = msg.client;
    }

    async Start(type, input) {
        switch (type) {
            case "members": {
                if (!this.msg.hasLevel(1)) throw "You require to be at least a Staff Member to run this command.";
                const role = await this.parse("role", input);
                return new RoleMembers(this.msg).run(role);
            }
            case "channel": {
                if (!this.msg.hasLevel(2)) throw "You require to be at least a Moderator Member to run this command.";
                const channel = await this.parse("channel", input);
                return new ChannelInfo(this.msg).run(channel);
            }
            case "server": {
                const guild = await this.parse("guild", input);
                return new GuildInfo(this.msg).run(guild);
            }
            case "flow": {
                if (!this.msg.hasLevel(1)) throw "You require to be at least a Staff Member to run this command.";
                const channel = await this.parse("channel", input);
                return new ChannelFlow(this.msg).run(channel);
            }
            case "perms":
            case "permissions": {
                if (!this.msg.hasLevel(2)) throw "You require to be at least a Moderator Member to run this command.";
                const member = await this.parse("member", input);
                return new PermissionUser(this.msg).run(member);
            }
            case "invite": {
                if (!this.msg.hasLevel(3)) throw "You require to be at least an Administrator Member to run this command.";
                if (!(/(discord\.gg\/|discordapp\.com\/invite\/).+/.test(input))) throw "You must provide a valid invite link.";
                const invite = /(discord\.gg\/|discordapp\.com\/invite\/)([^ ]+)/.exec(input);
                if (!invite) throw "Are you sure you provided a valid code?";
                const code = invite[2];
                const resolve = await this.client.fetchInvite(code);
                return new FetchInvite(this.msg).run(resolve);
            }
            default: throw `${type} does not match any of the possibilities.`;
        }
    }

    async parse(type, input = null) {
        switch (type) {
            case "role": {
                if (!input) return this.msg.member.highestRole;
                return fetchRole(input, this.guild);
            }
            case "channel": {
                if (!input) return this.channel;
                return fetchChannel(input, this.guild);
            }
            case "guild": {
                let guild;
                if (!input) guild = this.guild;
                else guild = this.client.guilds.get(input);
                if (!guild) throw "Guild not found";
                if ((guild.members.size / guild.memberCount) * 100 < 90) {
                    await this.msg.send("`Fetching data...`");
                    await guild.fetchMembers();
                }
                return guild;
            }
            case "member": {
                let user;
                if (!input) user = this.msg.author;
                else user = await fetchUser(input, this.guild);
                return this.guild.fetchMember(user.id).catch(() => { throw "User not found."; });
            }
            default: throw `${type} does not match any of the possibilities.`;
        }
    }
};

exports.run = async (client, msg, [type, ...search]) => {
    const run = new Run(msg);
    search = search.length ? search.join(" ") : null;
    return run.Start(type, search);
};

exports.conf = {
    enabled: true,
    runIn: ["text"],
    aliases: [],
    permLevel: 0,
    botPerms: [],
    requiredFuncs: [],
    spam: false,
    mode: 2,
    cooldown: 5,
};

exports.help = {
    name: "util",
    description: "Command Description",
    usage: "<members|channel|server|flow|permissions|perms|invite> [search:string] [...]",
    usageDelim: " ",
    extendedHelp: "",
};

const RoleMembers = class RoleMembers {
    constructor(msg) {
        this.msg = msg;
        this.client = msg.client;
    }

    run(role) {
        if (!role.members.size) throw "this role has no members.";
        const members = role.members.map(member => `\`${member.id}\` ❯ ${member.user.tag}`);
        const list = members.join("\n");
        const embed = new this.client.methods.Embed()
            .setColor(this.msg.member.highestRole.color || 0xdfdfdf)
            .setFooter(this.client.user.username, this.client.user.displayAvatarURL({ size: 128 }))
            .setTitle(`List of members for ${role.name} (${role.id})`);
        if (list.length < 2000) { embed.setDescription(list); } else {
            const splitted = this.client.methods.splitMessage(list, { char: "\n", maxLength: 1000 });
            splitted.forEach(text => embed.addField("\u200B", text));
        }
        return this.msg.send({ embed });
    }
};

const ChannelInfo = class ChannelInfo {
    constructor(msg) {
        this.msg = msg;
        this.guild = msg.guild;
        this.client = msg.client;
        this.resolve = ChannelInfo.resolve;
    }

    run(channel) {
        const roleInfo = channel.permissionOverwrites.map((m) => { // eslint-disable-line arrow-body-style
            const type = m.type === "role" ? this.guild.roles.get(m.id) : this.guild.members.get(m.id);
            return `• ${type} (${m.type}) has the permissions:${m.allowed.bitfield !== 0 ? this.resolve(m.allowed, "+") : ""}${m.denied.bitfield !== 0 ? this.resolve(m.denied, "-") : ""}`;
        }).join("\n\n");
        const embed = new this.client.methods.Embed()
            .setColor(this.msg.member.highestRole.color || 0xdfdfdf)
            .setDescription(`Info on **${channel.name}** (ID: ${channel.id})`)
            .addField("❯ Channel info",
                ` • **Type:** ${channel.type}\n` +
                ` • **Created at:** ${moment.utc(channel.createdAt).format("D/MM/YYYY [at] HH:mm:ss")}\n` +
                ` • **Position:** ${channel.position}\n` +
                ` ${channel.type === "text" ?
            ` • **Topic:** ${channel.topic === "" ? "Not set" : channel.topic}` :
            ` • **Bitrate:** ${channel.bitrate}\n• **User limit:** ${channel.userLimit}`}`,
            )
            .setThumbnail(this.guild.iconURL() || null)
            .setTimestamp();
        if (roleInfo) {
            const splitted = this.client.methods.splitMessage(roleInfo, { char: "\n", maxLength: 1000 });
            if (typeof splitted === "string") embed.addField("\u200B", splitted);
            else splitted.forEach(text => embed.addField("\u200B", text));
        }

        return this.msg.send({ embed });
    }

    static resolve(n, type) {
        const output = [""];
        for (let i = 0; i < PermissionFlags.length; i++) {
            if (n.has(PermissionFlags[i])) output.push(`\u200B    ${type === "+" ? "\\🔹" : "\\🔸"} ${toTitleCase(PermissionFlags[i].replace(/_/g, " "))}`);
        }
        return output.join("\n");
    }
};

const GuildInfo = class GuildInfo {
    constructor(msg) {
        this.msg = msg;
        this.client = msg.client;
        this.humanLevels = {
            0: "None",
            1: "Low",
            2: "Medium",
            3: "(╯°□°）╯︵ ┻━┻",
            4: "┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻",
        };
    }

    run(guild) {
        const emojis = guild.emojis.array().join(" ");
        const offline = guild.members.filter(m => m.user.presence.status === "offline");
        const online = guild.members.filter(m => m.user.presence.status !== "offline");
        const embed = new this.client.methods.Embed()
            .setColor(this.msg.member.highestRole.color || 0xdfdfdf)
            .setDescription(`Info on **${guild.name}** (ID: **${guild.id}**)\n\u200B`)
            .setThumbnail(guild.iconURL() || null)
            .addField("❯ Channels",
                ` • **${guild.channels.filter(ch => ch.type === "text").size}** Text, **${guild.channels.filter(ch => ch.type === "voice").size}** Voice\n` +
                ` • Default: **${guild.defaultChannel}**\n` +
                ` • AFK: ${guild.afkChannelID ?
                `  **<#${guild.afkChannelID}>** after **${guild.afkTimeout / 60}**min` :
                "  **None.**"}\n`
            , true)
            .addField("❯ Member",
                ` • **${guild.memberCount}** members\n` +
                ` • Owner: **${guild.owner.user.username}#${guild.owner.user.discriminator}**\n` +
                ` (ID: **${guild.ownerID}**)\n`
            , true)
            .addField("❯ Other",
                ` • Roles: **${guild.roles.size}**\n` +
                ` • Region: **${guild.region}**\n` +
                ` • Created at: **${moment.utc(guild.createdAt).format("dddd, MMMM Do YYYY, HH:mm:ss")}** (UTC)\n` +
                ` • Verification Level: **${this.humanLevels[guild.verificationLevel]}**\n`
            , true)
            .addField("❯ Users",
                `• Online/Offline users: **${online.size}**/**${offline.size}** (${Math.round((100 * online.size) / guild.memberCount)}% users online)\n` +
                `• **${guild.members.filter(m => m.joinedAt > this.msg.createdTimestamp - 86400000).size}** new users within the last 24h.\n`
            , true);

        if (emojis) {
            const splitted = this.client.methods.splitMessage(emojis, { char: " ", maxLength: 1000 });
            const emojiTitle = ["❯ Emojis", "\u200B"];
            if (typeof splitted === "string") embed.addField("❯ Emojis", splitted);
            else splitted.forEach((text, index) => embed.addField(emojiTitle[index], text, true));
        }

        return this.msg.send({ embed });
    }
};

const ChannelFlow = class ChannelFlow {
    constructor(msg) {
        this.msg = msg;
    }

    run(channel) {
        if (!channel.readable) throw `I am sorry, but I need the permission READ_MESSAGES in the channel ${channel}.`;
        return channel.fetchMessages({ limit: 100 }).then((messages) => {
            const amount = messages.filter(m => m.createdTimestamp > (this.msg.createdTimestamp - 60000)).size;
            return this.msg.send(`Dear ${this.msg.author}, ${amount} messages have been sent within the last minute.`);
        });
    }
};

const PermissionUser = class PermissionUser {
    constructor(msg) {
        this.msg = msg;
        this.client = msg.client;
    }

    run(member) {
        const { permissions } = member;
        const perm = ["\u200B"];
        for (let i = 0; i < PermissionFlags.length; i++) {
            perm.push(`${permissions.has(PermissionFlags[i]) ? "\\🔹" : "\\🔸"} ${toTitleCase(PermissionFlags[i].replace(/_/g, " "))}`);
        }

        const embed = new this.client.methods.Embed()
            .setColor(this.msg.guild.members.get(member.user.id).highestRole.color || 0xdfdfdf)
            .setTitle(`Permissions for ${member.user.tag} (${member.user.id})`)
            .setDescription(perm);

        return this.msg.send({ embed });
    }
};

const FetchInvite = class FetchInvite {
    constructor(msg) {
        this.msg = msg;
        this.client = msg.client;
    }

    run(invite) {
        const embed = new this.client.methods.Embed()
            .setColor(this.msg.color)
            .setFooter(`Invite created by: ${invite.inviter ? invite.inviter.tag : "Unknown"}`, (invite.inviter || this.msg.author).displayAvatarURL({ size: 128 }))
            .setThumbnail(invite.guild.icon ? `https://cdn.discordapp.com/icons/${invite.guild.id}/${invite.guild.icon}.webp` : null)
            .setTitle(`**${invite.guild.name}** (${invite.guild.id})`)
            .setDescription(
                `**${invite.memberCount}** members, **${invite.presenceCount}** users online.\n` +
                `**${invite.textChannelCount}** text channels and **${invite.voiceChannelCount}** voice channels.\n` +
                `Inviter: ${invite.inviter ? `**${invite.inviter.tag}** (${invite.inviter.id})` : "Unknown"}\n` +
                `Channel: **#${invite.channel.name}** (${invite.channel.id})\n`,
            )
            .addField("Invite",
                `Temporary: **${invite.temporary === undefined ? "Unknown." : invite.temporary}**\n` +
                `Uses: **${invite.uses === undefined ? "Unknown." : invite.uses}**\n` +
                `Max uses: **${invite.maxUses === undefined ? "Unknown." : invite.maxUses}**\n`,
            );
        return this.msg.send({ embed });
    }

};
