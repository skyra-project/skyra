const rand = [
  "55991", "56020", "236567", "215795", "198588", "239388", "55709",
  "304011", "239386", "137479", "95278", "393154", "61910", "264155",
  "239389", "239395", "293551", "22761", "265279", "137000", "293552",
  "449188", "140491", "203497", "112888", "3058440", "371698", "277752",
  "179920", "96127", "261963", "106499",
];

exports.run = async (client, msg) => {
  if (client.rdog === undefined) client.rdog = Math.ceil(Math.random() * rand.length);
  else if (client.rdog === rand.length - 1) client.rdog = 0;
  else client.rdog += 1;

  const randomdog = `https://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-${rand[client.rdog]}.jpg`;
  const embed = new client.methods.Embed()
    .setColor(msg.color)
    .setImage(randomdog);
  await msg.sendEmbed(embed);
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: ["doggo"],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: true,
  mode: 0,
  cooldown: 30,
};

exports.help = {
  name: "dog",
  description: "Check this doggo! ❤",
  usage: "",
  usageDelim: "",
  extendedHelp: [
    "Aww, have you seen this doggo? It's so cute!",
    "",
    "Examples:",
    "",
    "&doggo",
    "❯❯ And I send you a super cute doggo! ❤",
  ].join("\n"),
};
