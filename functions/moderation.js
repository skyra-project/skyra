const colour = {
  ban: 0xFF0200,
  unban: 0xFF4443,
  softban: 0xFF1A44,
  kick: 0xFFE604,
  mute: 0xFF6E23,
  unmute: 0xFF8343,
  warn: 0xFF8F2A,
  unwarn: 0xFF9C43,
};

/* eslint-disable no-underscore-dangle */
class Moderation {
  constructor(msg) {
    Object.defineProperty(this, "msg", { value: msg });
    Object.defineProperty(this, "guild", { value: msg.guild });
    Object.defineProperty(this, "client", { value: msg.client });
    this.anonymousModLog = Moderation.anonymousModLog;
  }

  static async anonymousModLog(client, guild, user, type) {
    if (user.action === type) {
      delete user.action;
      return;
    }
    const channel = guild.channels.get(guild.configs.channels.mod);
    if (!channel) return;

    /* Parse user */
    if (user.constructor.name !== "User") throw new Error("Moderation.js >> AsyncFunction <anonymousModLog> Does not accept an object different to <User>");
    const title = `${user.tag} (${user.id})`;

    /* Get case number */
    const thisCase = await guild.moderation.amountCases;

    const description = [
      `❯ **Action:** ${client.funcs.toTitleCase(type)}`,
      `❯ **User:** ${title}`,
      `❯ **Reason:** Please use \`${guild.configs.prefix}reason ${thisCase} to claim.\``,
    ];

    /* Send the Moderation Log to the respective channel */
    const embed = new client.methods.Embed()
      .setColor(colour[type])
      .setAuthor(client.user.username, client.user.displayAvatarURL)
      .setDescription(description.join("\n"))
      .setFooter(`AUTO | Case ${thisCase}`, client.user.displayAvatarURL)
      .setTimestamp();

    const thisMessage = await channel.send({ embed });

    /* Save the Moderation Log into the Database */
    await guild.moderation.pushCase(type, null, null, user.id, thisMessage.id, null);
  }

  async justifiedModLog(member, type, reason = null, extraData) {
    const configs = this.guild.configs;
    const channel = this.guild.channels.get(configs.channels.mod);
    if (!channel) return;

    /* Parse user */
    let user;
    if (member.constructor.name === "User") user = `${member.tag} (${member.id})`;
    else throw new Error("Moderation.js >> AsyncFunction <justifiedModLog> Does not accept an object different to <User>");

    /* Parse reason */
    if (reason instanceof Array) {
      if (!reason.length) reason = null;
      else reason = reason.join(" ");
    }

    /* Get case number */
    const thisCase = await this.guild.moderation.amountCases;

    const description = [
      `❯ **Action:** ${this.client.funcs.toTitleCase(type)}`,
      `❯ **User:** ${user}`,
      `❯ **Reason:** ${reason || `Please use \`${configs.prefix}reason ${thisCase} to claim.\``}`,
    ];

    /* Send the Moderation Log to the respective channel */
    const embed = new this.client.methods.Embed()
      .setColor(colour[type])
      .setAuthor(this.msg.author.username, this.msg.author.displayAvatarURL)
      .setDescription(description.join("\n"))
      .setFooter(`Case ${thisCase}`, this.client.user.displayAvatarURL)
      .setTimestamp();

    const thisMessage = await channel.send({ embed });

    /* Save the Moderation Log into the Database */
    await this.guild.moderation.pushCase(type, this.msg.author.id, reason, member.id, thisMessage.id, extraData);
  }

  async send(member, type, reason, extraData = null) {
    /* Initialize configuration */
    if (!this.guild.configs.exists) {
      const Create = new this.client.Create(this.client);
      Create.CreateGuild(this.guild.id);
    } else {
      await this.justifiedModLog(member, type, reason, extraData);
    }
  }
}

exports.init = (client) => { client.Moderation = Moderation; };
