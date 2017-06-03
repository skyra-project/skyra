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

exports.unknown = async (client, guild, user, type) => {
  if (user.action === type) {
    delete user.action;
    return;
  }
  const channel = this.getChannel(guild);
  if (!channel) return;
  const thisCase = await guild.moderation.amountCases;
  const description = this.generate(client, user, type, null, thisCase, guild.configs.prefix);
  const embed = this.createEmbed(client, type, null, description, thisCase, true);
  const thisMessage = await channel.send({ embed });
  await guild.moderation.pushCase(type, null, null, user.id, thisMessage.id, null);
};

exports.send = (client, msg, user, type, reason = null, extraData = null) => {
  if (msg.guild.configs.exists) msg.guild.configs.create();
  else this.justified(client, msg, user, type, reason, extraData).catch(e => client.emit("log", e, "error"));
};

exports.justified = async (client, msg, user, type, reason, extraData) => {
  const channel = this.getChannel(msg.guild);
  if (!channel) return;

    /* Parse reason */
  if (reason instanceof Array) {
    if (!reason.length) reason = null;
    else reason = reason.join(" ");
  }

  const thisCase = await msg.guild.moderation.amountCases;
  const description = this.generate(client, user, type, reason, thisCase, msg.guild.configs.prefix);
  const embed = this.createEmbed(client, type, msg.author, description, thisCase, false);
  const thisMessage = await channel.send({ embed });
  await msg.guild.moderation.pushCase(type, msg.author.id, reason, user.id, thisMessage.id, extraData);
};

exports.getChannel = guild => guild.configs.channels.mod ? guild.channels.get(guild.configs.channels.mod) : false; // eslint-disable-line no-confusing-arrow

exports.createEmbed = (client, type, moderator, description, thisCase, AUTO) => {
  if (AUTO) moderator = client.user;
  const embed = new this.client.methods.Embed()
    .setColor(colour[type])
    .setAuthor(moderator.username, moderator.displayAvatarURL)
    .setDescription(description)
    .setFooter(`${AUTO ? "AUTO |" : ""}Case ${thisCase}`, client.user.displayAvatarURL)
    .setTimestamp();
  return embed;
};

exports.generate = (client, user, type, reason, thisCase, prefix) => [
  `❯ **Action:** ${client.funcs.toTitleCase(type)}`,
  `❯ **User:** ${user.tag} (${user.id})`,
  `❯ **Reason:** ${reason || `Please use \`${prefix}reason ${thisCase} to claim.\``}`,
].join("\n");
