const MODERATION = require("../../utils/managerModeration");

exports.run = async (client, msg, [index]) => {
  const cases = await msg.guild.moderation.cases;

  if (!cases[index]) throw "This case doesn't seem to exist.";

  const moderator = cases[index].moderator ? await client.fetchUser(cases[index].moderator) : null;

  const user = await client.fetchUser(cases[index].user);
  const description = MODERATION.generate(client, user, cases[index].type, cases[index].reason, cases[index].thisCase, msg.guild.configs.prefix);
  const embed = MODERATION.createEmbed(client, cases[index].type, moderator, description, cases[index].thisCase, !!moderator);
  return msg.send({ embed });
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: [],
  permLevel: 2,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 2,
  cooldown: 5,
};

exports.help = {
  name: "case",
  description: "Get the information from a case by its index.",
  usage: "<Case:int>",
  usageDelim: " ",
};
