module.exports = (client, msg) => {
  if (client.config.prefixMention.test(msg.content)) return client.config.prefixMention;
  let prefix = msg.guild ? msg.guild.configs.prefix : "&";
  prefix = new RegExp(`^${client.funcs.regExpEsc(prefix)}|${client.config.userFriendlyRegExp}`, "i");
  return prefix.test(msg.content) ? prefix : false;
};
