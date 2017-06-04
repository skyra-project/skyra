const { kyraFetch } = require("../../utils/kyraFetch");
const cheerio = require("cheerio");

exports.run = async (client, msg, [input]) => {
  const { data } = await kyraFetch(`https://www.google.com/search?tbm=isch&gs_l=img&safe=medium&q=${encodeURIComponent(input)}`);
  const $ = cheerio.load(data);
  const result = $(".images_table").find("img").first().attr("src");

  return msg.channel.send(`Search results for \`${input}\``, { files: [{ attachment: result, name: "query.png" }] });
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
