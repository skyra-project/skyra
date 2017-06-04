const constants = require("../../utils/constants");
const seedrandom = require("seedrandom");

exports.run = async (client, msg, [rateuser]) => {
  let ratewaifu;
  let rate;
  if (/^(you|yourself)$/i.test(rateuser)) {
    rate = "100";
    ratewaifu = "I love myself a lot 😊";
    rateuser = "myself";
  } else {
    if (/^(myself|me)$/i.test(rateuser)) rateuser = msg.author.username;
    else rateuser = rateuser.replace(/\bmy\b/g, "your");

    rate = Math.ceil(100 - (100 * seedrandom(rateuser.toLowerCase()).double()));
    ratewaifu = constants.oneToTen(Math.floor(rate / 10)).emoji;
  }

  return msg.send(`**${msg.author.username}**, I'd give **${rateuser}** a **${rate}**/100 ${ratewaifu}`);
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: ["ratewaifu"],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: true,
  mode: 0,
  cooldown: 10,
};

exports.help = {
  name: "rate",
  description: "Let bots have opinions and rate somebody.",
  usage: "<user:str>",
  usageDelim: "",
  extendedHelp: [
    "Hey! Do you want to know what I'd rate something?",
    "",
    "Usage:",
    "&rate <user>",
    "",
    " ❯ User: User or thing you want me to rate.",
    "",
    "Examples:",
    "&rate Doppio",
  ].join("\n"),
};
