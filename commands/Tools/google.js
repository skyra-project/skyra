const cheerio = require("cheerio");

function getText(children) {
  if (children.children) return getText(children.children);
  return children.map(c => c.children ? getText(c.children) : c.data).join(""); // eslint-disable-line no-confusing-arrow
}

exports.run = async (client, msg, [input]) => {
  try {
    const res = await client.wrappers.request(`http://google.com/search?client=chrome&rls=en&ie=UTF-8&oe=UTF-8&lr=lang_en&q=${encodeURIComponent(input)}`);
    const $ = cheerio.load(res);
    let results = [];
    let raw;

    $(".g").each((i) => { results[i] = {}; });
    $(".g>.r>a").each((i, e) => {
      raw = e.attribs.href;
      results[i].link = raw.substr(7, raw.indexOf("&sa=U") - 7);
    });
    $(".g>.s>.st").each((i, e) => { results[i].description = getText(e); });

    results = results.filter(r => r.link && r.description);
    results = results.splice(0, 4);

    if (!results.length) throw new Error(client.constants.httpResponses(404));
    const embed = new client.methods.Embed()
      .setColor(msg.guild.members.get(client.user.id).highestRole.color || 0xdfdfdf)
      .setFooter("Google Search")
      .setDescription(results.map(r => `${decodeURIComponent(r.link)}\n\t${r.description}\n`).join("\n"))
      .setTimestamp();
    await msg.send(`Search results for \`${input.join(" ")}\``, { embed });
  } catch (e) {
    msg.error(e);
  }
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: ["search"],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 1,
};

exports.help = {
  name: "google",
  description: "Search stuff throught Google.",
  usage: "<input:string>",
  usageDelim: "",
  extendedHelp: "",
};
