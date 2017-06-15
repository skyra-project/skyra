exports.run = async (client, msg) => msg.send(`Dear ${msg.author}, you have a total of ${msg.author.profile.money}${msg.shiny}`);

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: ["bal", "credits"],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: true,
  mode: 1,
  cooldown: 10,
};

exports.help = {
  name: "balance",
  description: "Check your balance!",
  usage: "",
  usageDelim: " ",
  extendedHelp: "",
};
