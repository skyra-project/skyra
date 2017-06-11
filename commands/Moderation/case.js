const MODERATION = require("../../utils/managerModeration");

exports.run = async (client, msg, [index]) => {
  const cases = await msg.guild.moderation.cases;

  if (!cases[index]) throw "This case doesn't seem to exist.";
  const thisCase = cases[index];

  const moderator = thisCase.moderator ? await client.fetchUser(thisCase.moderator) : null;
  const user = await client.fetchUser(thisCase.user);
  const description = MODERATION.generate(client, user, thisCase.type, thisCase.reason, thisCase.thisCase, msg.guild.configs.prefix);
  const embed = MODERATION.createEmbed(client, thisCase.type, moderator, description, thisCase.thisCase, !moderator);
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
