const moment = require("moment");

const sortRanks = (a, b) => b.position > a.position;

exports.run = async (client, msg, [search = msg.member]) => {
  /* Initialize Search */
  const user = await client.funcs.search.User(search, msg.guild);
  const member = msg.guild.member(user) || null;

  const embed = new client.methods.Embed();
  if (member) {
    embed.setColor(member.highestRole.color || 0xdfdfdf)
      .setTitle(`${user.bot ? "[BOT] " : ""}${user.tag}`)
      .setURL(user.displayAvatarURL)
      .setDescription([
        `${member.nickname ? `aka **${member.nickname}**.\n` : ""}`,
        `With an ID of \`${user.id}\`,`,
        `this user is **${user.presence.status}**${user.presence.game ? `, playing: **${user.presence.game.name}**` : "."}`,
        "\n",
        `\nJoined Discord on ${moment.utc(user.createdAt).format("D/MM/YYYY [at] HH:mm:ss")}`,
        `\nJoined ${msg.guild.name} on ${moment.utc(member.joinedAt).format("D/MM/YYYY [at] HH:mm:ss")}`,
      ].join(" "))
      .setThumbnail(user.displayAvatarURL)
      .setFooter(`${client.user.username} ${client.version} | ${user.id}`, client.user.displayAvatarURL)
      .setTimestamp();
    if (member.roles.size > 1) {
      embed.addField("❯ Roles:", member.roles
        .array()
        .slice(1)
        .sort(sortRanks)
        .map(r => r.name)
        .join(", "));
    }
  } else {
    embed.setColor(0xdfdfdf)
      .setTitle(`${user.bot ? "[BOT] " : ""}${user.tag}`)
      .setURL(user.displayAvatarURL)
      .setDescription([
        `With an ID of \`${user.id}\``,
        "\n",
        `Joined Discord at ${moment.utc(user.createdAt).format("D/MM/YYYY [at] HH:mm:ss")}`,
      ].join(" "), true)
      .setThumbnail(user.displayAvatarURL)
      .setFooter(`${client.user.username} ${client.version} | ES | ${user.id}`, client.user.displayAvatarURL)
      .setTimestamp();
  }

  return msg.send({ embed });
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: [],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 2,
  cooldown: 5,
};

exports.help = {
  name: "whois",
  description: "Who are you?",
  usage: "[query:str]",
  usageDelim: "",
  extendedHelp: [
    "Who are you?",
    "",
    " ❯ User :: ID, mention, nickname, username, or even, a part of the name.",
    "",
    "Examples:",
    "&whois Skyra",
  ].join("\n"),
};
