const moment = require("moment");

exports.run = async (client, msg, [user]) => {
  const url = `https://twitrss.me/twitter_user_to_rss/?user=${encodeURIComponent(user)}`;
  try {
    const result = await client.wrappers.requestXML(url);
    let index = 0;
    const twits = result.rss.channel[0].item;
    if (!twits || !twits[0]) throw new Error(client.constants.httpResponses(404));
    if (twits[1] && Date.parse(twits[0].pubDate[0]) < Date.parse(twits[1].pubDate[0])) index = 1;
    const embed = new client.methods.Embed()
      .setColor(msg.color)
      .setTitle(`Lastest twit by ${twits[index]["dc:creator"][0].replace("Verified account", "")}`)
      .setURL(twits[index].link[0] || undefined)
      .setDescription(`${twits[index].title[0].split("pic.twitter.com/")[0]}\n\u200B`)
      .setFooter(moment.utc(Date.parse(twits[index].pubDate[0])).format("dddd, MMMM Do YYYY, HH:mm:ss"));
    if (twits[index].title[0].split("pic.twitter.com/")[1]) embed.setImage(`https://pbs.twimg.com/${twits[index].title[0].split("pic.twitter.com/")[1]}.jpg`);
    await msg.sendEmbed(embed);
  } catch (e) {
    if (e.toString().match("404")) {
      msg.error("User profile not found. You might have spelled the username wrong or something.", msg);
    } else { msg.error(e); }
  }
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
};

exports.help = {
  name: "twitter",
  description: "Check info from Twitter",
  usage: "<user:str>",
  usageDelim: "",
  extendedHelp: "",
};
