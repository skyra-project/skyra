/* eslint-disable no-restricted-syntax */
exports.run = (client, msg) => {
  if (msg.channel.type !== "text") return;

  const configs = msg.guild.configs;

  if (configs.modLogProtection && configs.channels.mod && msg.channel.id === configs.channels.mod) {
    client.wrappers.copyPaste(msg);
  }
};
