exports.conf = {
  enabled: true,
  spamProtection: false,
  priority: 6,
};

exports.run = (client, msg, cmd) => {
  if (msg.channel.type !== "text" || !cmd.conf.mode || msg.guild.configs.mode <= cmd.conf.mode) return false;
  if (msg.author.id === client.config.ownerID) return false;
  return true;
};
