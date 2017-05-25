exports.run = async (client, msg) => {
  if (client.config.selfbot) return msg.reply("Why would you need an invite link for a selfbot...");

  return msg.send([
    `To add ${client.user.username} to your discord guild: <${client.invite}>`,
    "Don't be afraid to uncheck some permissions, Skyra will let you know if you're trying to run a command without permissions.",
  ]);
};

exports.help = {
  name: "invite",
  description: "Displays the join server link of the bot.",
  usage: "",
  usageDelim: "",
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: [],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
};
