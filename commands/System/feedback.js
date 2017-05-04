exports.run = async (client, msg, [feedback]) => {
  const embed = new client.methods.Embed()
    .setColor(0x06d310)
    .setAuthor(`${msg.author.tag}`, msg.author.displayAvatarURL)
    .setDescription(feedback)
    .setFooter(`${msg.author.id} | Feedback`)
    .setTimestamp();

  try {
    await client.channels.get("257561807500214273").sendEmbed(embed);
    await msg.alert(`Dear ${msg.author}, thanks you for sending us feedback!`);
    msg.nuke(5000);
  } catch (e) {
    msg.error(e);
  }
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: [],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 2,
};

exports.help = {
  name: "feedback",
  description: "Send a feedback to the bot's owner.",
  usage: "<message:str{8,1900}>",
  usageDelim: "",
  extendedHelp: "",
};
