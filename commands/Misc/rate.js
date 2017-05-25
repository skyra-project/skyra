const seedrandom = require("seedrandom");

exports.run = async (client, msg, [rateuser]) => {
  let ratewaifu;
  let rate;
  if (/you|yourself/i.test(rateuser)) {
    rate = "100";
    ratewaifu = "I love myself a lot 😊";
    rateuser = "myself";
  } else {
    if (/^(myself|me)$/i.test(rateuser)) rateuser = msg.author.username;
    else rateuser = rateuser.replace(/\bmy\b/, "your");

    const rng = 10 - (10 * seedrandom(rateuser.toLowerCase()).quick("kyra"));
    rate = Math.ceil(rng);
    ratewaifu = client.constants.oneToTen(rate).emoji;
  }

  await msg.send(`**${msg.author.username}**, I'd give **${rateuser}** a **${rate * 10}**/100 ${ratewaifu}`);
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
