const { JSON: fetchJSON } = require("../../utils/kyraFetch");
const constants = require("../../utils/constants");
const moment = require("moment");

const { twitch } = constants.getConfig.tokens;

/* eslint-disable no-underscore-dangle */
exports.run = async (client, msg, [twitchName]) => {
  try {
    const { data } = await fetchJSON(`https://api.twitch.tv/kraken/channels/${twitchName}?client_id=${twitch}`);
    const creationDate = moment(data.created_at).format("DD-MM-YYYY");
    const embed = new client.methods.Embed()
      .setColor(6570406)
      .setDescription([
        `**Game**: ${data.game}`,
        `**Status**: ${data.status}`,
        `**Followers**: ${data.followers}`,
      ].join("\n"))
      .setThumbnail(data.logo)
      .setAuthor(`${data.display_name} (${data._id})`, "https://i.imgur.com/OQwQ8z0.jpg", data.url)
      .addField("Created On", creationDate, true)
      .addField("Channel Views", data.views, true);
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
