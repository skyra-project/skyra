exports.conf = {
  enabled: true,
  spamProtection: false,
  priority: 5,
};

exports.run = (client, msg, cmd) => {
  if (msg.channel.type !== "text") return false;
  if (msg.author.id === client.config.ownerID) return false;
  return msg.guild.configs.disabledCommands.includes(cmd.help.name);
};
