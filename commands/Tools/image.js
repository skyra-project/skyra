const cheerio = require("cheerio");

exports.run = async (client, msg, [input]) => {
  const res = await client.wrappers.request(`https://www.google.com/search?tbm=isch&gs_l=img&safe=medium&q=${encodeURIComponent(input)}`);
  const $ = cheerio.load(res);
  const result = $(".images_table").find("img").first().attr("src");

  await msg.channel.sendFile(result, "result.png", `Search results for \`${input}\``);
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: [],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 1,
  cooldown: 30,
};

exports.help = {
  name: "image",
  description: "Search images (thumbnails) from Google.",
  usage: "<input:string>",
  usageDelim: "",
  extendedHelp: "",
};
