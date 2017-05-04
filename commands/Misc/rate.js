const seedrandom = require("seedrandom");

exports.run = async (client, msg, [rateuser]) => {
  try {
    let ratewaifu;
    let rate;
    let rated = rateuser.toLowerCase();
    if (/you|yourself/i.test(rated)) {
      rate = "100";
      ratewaifu = "I love myself a lot 😊";
      rateuser = "myself";
    } else {
      if (/^(myself|me)$/i.test(rated)) rateuser = msg.author.username;
      else rated = rated.replace(/\bmy\b/, "your");

      const rng = 10 - (10 * seedrandom(rated.toLowerCase()).quick("kyra"));
      rate = Math.ceil(rng);
      ratewaifu = client.constants.oneToTen(rate).emoji;
    }

    await msg.send(`**${msg.author.username}**, I'd give **${rateuser}** a **${rate * 10}**/100 ${ratewaifu}`);
  } catch (e) {
    msg.error(e);
  }
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
