exports.run = async (client, msg) => {
  const embed = new client.methods.Embed()
    .setColor(msg.color)
    .setTitle("All available tags")
    .setDescription(client.tags.map(s => client.funcs.toTitleCase(s.name)).join(" | "));
  await msg.sendEmbed(embed);
};

exports.conf = {
  enabled: false,
  runIn: ["text", "dm", "group"],
  aliases: ["taglist"],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: true,
  mode: 0,
};

exports.help = {
  name: "tags",
  description: "Check all available tags.",
  usage: "",
  usageDelim: "",
  extendedHelp: "",
};
