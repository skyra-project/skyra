exports.run = async (client, msg, [input]) => {
  const color = client.ResolverColor.validate(input);
  await msg.author.profile.update({ color: color.hex.parsed });

  const embed = new client.methods.Embed()
    .setColor(`0x${color.hex.parsed}`)
    .setAuthor(msg.author.tag, msg.author.displayAvatarURL)
    .setDescription(`Colour changed to #${color.hex.parsed}`);
  await msg.sendEmbed(embed);
};

exports.conf = {
  enabled: true,
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
  extendedHelp: [
    "I don't like the default pink colour!",
    "",
    "You can set your color by using:",
    "  HEX: #dfdfdf",
    "  RGB: rgb(200, 200, 200)",
    "  HSL: hsl(350, 100, 100)",
  ].join("\n"),
};
