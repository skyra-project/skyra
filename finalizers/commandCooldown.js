exports.run = (client, msg) => {
  if (msg.author.id === client.config.ownerID) return;
  if (!msg.cmdMsg.cmd.conf.cooldown || msg.cmdMsg.cmd.conf.cooldown <= 0) return;

  msg.cmdMsg.cmd.cooldown.set(msg.author.id, Date.now());
  setTimeout(() => msg.cmdMsg.cmd.cooldown.delete(msg.author.id), msg.cmdMsg.cmd.conf.cooldown * 1000);
};
