exports.run = async (client, msg, [input]) => {
  input = encodeURIComponent(input.split(" ").join("_").toLowerCase());
  const URL = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&indexpageids=1&redirects=1&explaintext=1&exsectionformat=plain&titles=${encodeURIComponent(input)}`;

  const res = await client.wrappers.requestJSON(URL);
  if (res.query.pageids[0] === "-1") throw new Error(client.constants.httpResponses(404));

  const content = res.query.pages[res.query.pageids[0]];
  const wdef = content.extract.length > 1000 ?
    `${client.funcs.splitText(content.extract, 1000)}... [continue reading](https://en.wikipedia.org/wiki/${encodeURIComponent(input).replace(/\(/g, "%28").replace(/\)/g, "%29")})` :
    content.extract;

  const embed = new client.methods.Embed()
    .setTitle(content.title)
    .setURL(`https://en.wikipedia.org/wiki/${encodeURIComponent(input)}`)
    .setColor(0x05C9E8)
    .setThumbnail("https://en.wikipedia.org/static/images/project-logos/enwiki.png")
    .setDescription(`**Description**:\n${wdef.replace(/[\u000A]{2,}/g, "\u000A")}`)
    .setFooter("© Wikipedia - Creative Commons Attribution-ShareAlike 3.0");

  await msg.sendEmbed(embed);
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: ["wiki"],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: ["splitText"],
  spam: false,
  mode: 1,
  cooldown: 15,
};

exports.help = {
  name: "wikipedia",
  description: "Search something throught Wikipedia.",
  usage: "<query:str>",
  usageDelim: "",
  extendedHelp: [
    "Wikipedia!",
    "",
    " ❯ Query: the word or phrase whose description you want to get.",
    "",
    "Examples:",
    "&wiki Artificial Intelligence",
  ].join("\n"),
};
