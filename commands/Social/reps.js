exports.run = async (client, msg) => {
  const rep = msg.author.profile.reputation;
  await msg.send(`Dear ${msg.author}, you have a total of ${rep} reputation point${rep !== 1 ? "s" : ""}`);
};


exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: [],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: true,
  mode: 1,
  cooldown: 60,
};

exports.help = {
  name: "reps",
  description: "Check how many reputation points do you have.",
  usage: "",
  usageDelim: " ",
  extendedHelp: "",
};
