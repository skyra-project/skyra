const snekfetch = require("snekfetch");
const moment = require("moment");

/* eslint-disable no-underscore-dangle */
exports.run = async (client, msg, [twitchName]) => {
  try {
    const clientID = client.constants.config.twitch;
    await msg.send(`Fetching info for ${twitchName}...`);
    const { body } = await snekfetch.get(`https://api.twitch.tv/kraken/channels/${twitchName}?client_id=${clientID}`);
    const creationDate = moment(body.created_at).format("DD-MM-YYYY");
    const embed = new client.methods.Embed()
      .setColor(6570406)
      .setDescription([
        `**Game**: ${body.game}`,
        `**Status**: ${body.status}`,
        `**Followers**: ${body.followers}`,
      ].join("\n"))
      .setThumbnail(body.logo)
      .setAuthor(`${body.display_name} (${body._id})`, "https://i.imgur.com/OQwQ8z0.jpg", body.url)
      .addField("Created On", creationDate, true)
      .addField("Channel Views", body.views, true);
    await msg.sendEmbed(embed);
  } catch (e) {
    msg.send("Unable to find account. Did you spell it correctly?");
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
  cooldown: 30,
};

exports.help = {
  name: "twitch",
  description: "Returns information on a Twitch.tv Account",
  usage: "<name:str>",
  usageDelim: "",
};
