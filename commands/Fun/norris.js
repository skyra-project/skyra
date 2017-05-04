exports.run = async (client, msg) => {
  try {
    const res = await client.wrappers.requestJSON("https://api.chucknorris.io/jokes/random");
    const embed = new client.methods.Embed()
      .setColor(msg.color)
      .setDescription(`📢 **Chuck Norris' fact:** *${res.value}*`);

    await msg.sendEmbed(embed);
  } catch (e) {
    msg.error(e);
  }
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: ["chucknorris"],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: true,
  mode: 0,
};
exports.help = {
  name: "norris",
  description: "Read the ~~most popular~~ funniest phrases from Chuck Norris.",
  usage: "",
  usageDelim: "",
  extendedHelp: [
    "What does Chuck Norris say?",
    "",
    "Examples:",
    "&norris",
    "❯❯ When Chuck Norris opened his mouth he made dodo birds extinct. (random)",
  ].join("\n"),
};
