exports.run = async (client, msg) => {
  try {
    const res = await client.wrappers.requestJSON("http://catfacts-api.appspot.com/api/facts");
    const embed = new client.methods.Embed()
      .setColor(msg.color)
      .setDescription(`📢 **Catfact:** *${res.facts[0]}*`);

    await msg.sendEmbed(embed);
  } catch (e) {
    msg.error(e);
  }
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: ["catfact", "kittenfact"],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: true,
  mode: 0,
};

exports.help = {
  name: "catfacts",
  description: "Let me tell you a misterious cat fact.",
  usage: "",
  usageDelim: "",
  extendedHelp: [
    "Do you know something misterious? Kittens!",
    "",
    "Examples:",
    "&catfact",
    "❯❯ \" The color of the points in Siamese cats is heat related. Cool areas are darker. \" (random)",
  ].join("\n"),
};
