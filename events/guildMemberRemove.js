const Discord = require("discord.js");

class GuildMemberRemove {
    constructor(member) {
        Object.defineProperty(this, "member", { value: member });
        Object.defineProperty(this, "guild", { value: member.guild });
        Object.defineProperty(this, "configs", { value: member.guild.settings });
        Object.defineProperty(this, "client", { value: member.client });
    }

    sendLog(alert = false) {
        const logs = this.configs.channels.log;
        if (!logs) return false;
        const logChannel = this.guild.channels.get(logs);
        const embed = new Discord.MessageEmbed();
        switch (alert) {
            case false:
                embed.setColor(0xdf5656)
                    .setAuthor(`${this.member.user.tag} (${this.member.user.id})`, this.member.user.displayAvatarURL({ size: 128 }))
                    .setFooter("User left")
                    .setTimestamp();
                break;
            case "disable":
                embed.setColor(0x8C0074)
                    .setAuthor(`${this.client.user.tag}`, this.member.user.displayAvatarURL({ size: 128 }))
                    .setFooter("AUTO | Disabled guildMemberRemove")
                    .setTimestamp();
                break;
            default:
      // no default
        }
        return logChannel.send({ embed });
    }

    handle() {
        const configs = this.configs;
        if (configs && configs.events.guildMemberRemove) {
            this.sendLog();
            const farewellChannel = configs.messages.farewell;
            const defaultChannel = configs.channels.default;
            if (farewellChannel && defaultChannel) this.sendMessage(defaultChannel);
        }
    }

    get message() {
        const custom = this.configs.messages.farewellMessage;
        if (custom) {
            return custom
                .replace(/%MEMBER%/g, this.member)
                .replace(/%MEMBERNAME%/g, this.member.user.username)
                .replace(/%GUILD%/g, this.guild);
        }
        return `Good bye ${this.member}, we will miss you!`;
    }

    sendMessage(channel) {
        const target = this.guild.channels.get(channel);
        if (target) return target.send(this.message);
        this.guild.update({ channels: { default: null }, messages: { farewell: false } });
        return this.sendLog("disable");
    }
}

exports.run = (client, member) => {
    const Handle = new GuildMemberRemove(member);
    Handle.handle();
};
