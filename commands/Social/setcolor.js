exports.run = async (client, msg, [input]) => {
  const { hex, b10 } = client.funcs.resolveColor.validate(input);
  const color = hex.toString().slice(1);
  await msg.author.profile.update({ color });

  const embed = new client.methods.Embed()
    .setColor(b10.value)
    .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ size: 128 }))
    .setDescription(`Colour changed to ${hex.toString()}`);
  return msg.send({ embed });
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
  cooldown: 30,
};

exports.help = {
  name: "setcolor",
  description: "Change your userprofile's colour.",
  usage: "<color:string>",
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
