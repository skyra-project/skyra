exports.run = async (client, msg, [input]) => {
  try {
    const color = client.ResolverColor.validate(input);
    await client.rethink.update("users", msg.author.id, { color: color.hex.parsed });
    const embed = new client.methods.Embed()
      .setColor(`0x${color.hex.parsed}`)
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL)
      .setDescription(`Colour changed to #${color.hex.parsed}`);
    await msg.sendEmbed(embed);
  } catch (e) {
    msg.error(e);
  }
};

exports.conf = {
  enabled: false,
  runIn: ["text", "dm", "group"],
  aliases: ["setcolour"],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: true,
  mode: 1,
  cooldown: 60,
};

exports.help = {
  name: "setcolor",
  description: "Change your userprofile's colour.",
  usage: "<color:str>",
  usageDelim: "",
  extendedHelp: "",
};
