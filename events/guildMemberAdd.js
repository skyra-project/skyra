const Discord = require("discord.js");

class GuildMemberAdd {
  constructor(member) {
    Object.defineProperty(this, "member", { value: member });
    Object.defineProperty(this, "guild", { value: member.guild });
    Object.defineProperty(this, "configs", { value: member.guild.configs });
    Object.defineProperty(this, "client", { value: member.client });
  }

  sendLog(alert = null) {
    const logs = this.configs.channels.log;
    if (!logs) return false;
    const logChannel = this.guild.channels.get(logs);
    const embed = new Discord.RichEmbed();
    switch (alert) {
      case null:
        embed.setColor(0x23ff23)
          .setAuthor(`${this.member.user.tag} (${this.member.user.id})`, this.member.user.displayAvatarURL)
          .setFooter("User joined")
          .setTimestamp();
        break;
      case "disable":
        embed.setColor(0x8C0074)
          .setAuthor(`${this.client.user.tag}`, this.member.user.displayAvatarURL)
          .setFooter("AUTO | Disabled guildMemberAdd")
          .setTimestamp();
        break;
      case "muteRemove":
        embed.setColor(0x8C0074)
          .setAuthor(`${this.client.user.tag}`, this.member.user.displayAvatarURL)
          .setFooter("AUTO | Removed Roles >> Muted")
          .setTimestamp();
        break;
      case "roleRemove":
        embed.setColor(0x8C0074)
          .setAuthor(`${this.client.user.tag}`, this.member.user.displayAvatarURL)
          .setFooter("AUTO | Removed Role >> InitialRole")
          .setTimestamp();
        break;
      case "mute":
        embed.setColor(0xff1331)
          .setAuthor(`${this.member.user.tag} (${this.member.user.id})`, this.member.user.displayAvatarURL)
          .setFooter("Muted user joined")
          .setTimestamp();
        break;
      default:
      // no default
    }
    return logChannel.send({ embed });
  }

  handleMute() {
    this.sendLog("mute");
    if (!this.guild.me.permissions.has("MANAGE_ROLES_OR_PERMISSIONS")) return false;
    const muteRole = this.configs.roles.muted;
    if (!muteRole) return false;
    const role = this.guild.roles.get(muteRole);
    if (role) return this.member.addRole(role);
    this.configs.update({ roles: { muted: null } });
    return this.sendLog("muteRemove");
  }

  async giveInitial() {
    const roleID = this.configs.initialRole;
    const role = this.guild.roles.get(roleID);
    if (roleID && !role) {
      await this.configs.update({ initialRole: null });
      await this.sendLog("roleRemove");
      return;
    }
    await this.member.addRole(role);
  }

  notMuted() {
    const configs = this.configs;
    if (configs.initialRole) this.giveInitial().catch();
    if (configs.events.guildMemberAdd) {
      this.sendLog();
      const greetingChannel = configs.messages.greeting;
      const defaultChannel = configs.channels.default;
      if (greetingChannel && defaultChannel) this.sendMessage(defaultChannel);
    }
  }

  get message() {
    const custom = this.configs.messages.greetingMessage;
    if (custom) {
      return custom
        .replace(/%MEMBER%/g, this.member)
        .replace(/%MEMBERNAME%/g, this.member.user.username)
        .replace(/%GUILD%/g, this.guild);
    }
    return `Welcome ${this.member} to ${this.guild.name}!`;
  }

  sendMessage(channel) {
    const target = this.guild.channels.get(channel);
    if (target) return target.send(this.message);
    this.configs.update({
      channels: { default: null },
      events: { sendMessage: { greeting: false } },
    });
    return this.sendLog("disable");
  }

  manage() {
    if (this.Mutes) return this.handleMute();
    return this.notMuted();
  }

  get Mutes() {
    return this.guild.configs.mutes.has(this.member.id);
  }
}

exports.run = (client, member) => {
  const Handle = new GuildMemberAdd(member);
  Handle.manage();
};
