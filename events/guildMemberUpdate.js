const Discord = require("discord.js");

/* eslint-disable no-underscore-dangle */
class GuildMemberUpdate {
    constructor(oldMember, newMember) {
        Object.defineProperty(this, "oMember", { value: oldMember });
        Object.defineProperty(this, "nMember", { value: newMember });
        Object.defineProperty(this, "guild", { value: newMember.guild });
        Object.defineProperty(this, "configs", { value: newMember.guild.settings });
        Object.defineProperty(this, "client", { value: newMember.client });
    }

    sendLog(oRoles = [], nRoles = []) {
        const logs = this.configs.channels.log;
        if (!logs) return;
        const initialRole = this.configs.initialRole;
        if (initialRole) {
            if (oRoles.length === 0 && nRoles.length === 1 && nRoles[0] === initialRole) return;
        }
        const logChannel = this.guild.channels.get(logs);
        const output = [];
        if (nRoles.length) output.push(`Added: ${nRoles.map(r => this.guild.roles.get(r).name).sort().join(", ")}`);
        if (oRoles.length) output.push(`Removed: ${oRoles.map(r => this.guild.roles.get(r).name).sort().join(", ")}`);
        const embed = new Discord.MessageEmbed()
            .setColor(0xf6ff00)
            .setAuthor(`${this.nMember.user.tag} (${this.nMember.user.id})`, this.nMember.user.displayAvatarURL({ size: 128 }))
            .setDescription(output.join("\n"))
            .setFooter("Member Update")
            .setTimestamp();
        logChannel.send({ embed });
    }

    handle() {
        const configs = this.configs;
        if (configs && configs.events.guildMemberUpdate) {
            const oRoles = GuildMemberUpdate.comparison(this.oMember._roles, this.nMember._roles);
            const nRoles = GuildMemberUpdate.comparison(this.nMember._roles, this.oMember._roles);
            if (oRoles.length || nRoles.length) this.sendLog(oRoles, nRoles);
        }
    }

    static comparison(arr1, arr2) {
        const output = [];
        arr1.forEach((v) => { if (!arr2.includes(v)) output.push(v); });
        return output;
    }
}

exports.run = (client, oldMember, newMember) => {
    const Handle = new GuildMemberUpdate(oldMember, newMember);
    return Handle.handle();
};
