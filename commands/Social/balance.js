exports.run = async (client, msg) => {
  await msg.send(`Dear ${msg.author}, you have a total of ${msg.author.profile.money}₪`);
};


exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: ["bal"],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: true,
  mode: 1,
  cooldown: 60,
};

exports.help = {
  name: "balance",
  description: "Check your balance!",
  usage: "",
  usageDelim: " ",
  extendedHelp: "",
};
