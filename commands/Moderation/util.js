/* eslint-disable no-use-before-define */
class Run {
  constructor(msg) {
    this.msg = msg;
    this.guild = msg.guild;
    this.channel = msg.channel;
    this.client = msg.client;
  }

  async Start(type, input) {
    switch (type) {
      case "members": {
        const role = await this.parse("role", input);
        await roleMembers(this.client, this.msg, role);
        break;
      }
      case "channel": {
        const channel = await this.parse("channel", input);
        await channelInfo(this.client, this.msg, channel);
        break;
      }
      case "server": {
        const guild = await this.parse("guild", input);
        await guildInfo(this.client, this.msg, guild);
        break;
      }
      case "flow": {
        const channel = await this.parse("channel", input);
        await channelFlow(this.client, this.msg, channel);
        break;
      }
      case "perms":
      case "permissions": {
        const member = await this.parse("member", input);
        await permissionUser(this.client, this.msg, member);
        break;
      }
      default: throw new Error("Invalid type.");
    }
  }

  async parse(type, input = null) {
    switch (type) {
      case "role": {
        if (!input) return this.msg.member.highestRole;
        return this.client.search.Role(input, this.guild);
      }
      case "channel": {
        if (!input) return this.channel;
        return this.client.search.Channel(input, this.guild);
      }
      case "guild": {
        let guild;
        if (!input) guild = this.guild;
        else guild = this.client.guilds.get(input);
        if (!guild) throw new Error("Guild not found");
        if ((guild.members.size / guild.memberCount) * 100 < 90) {
          await this.msg.send("`Fetching data...`");
          await guild.fetchMembers();
        }
        return guild;
      }
      case "member": {
        let user;
        await this.msg.send("`Fetching data...`");
        if (!input) user = this.msg.author;
        else user = this.client.search.User(input, this.guild);
        const member = this.guild.member(user) || null;
        if (!member) throw new Error("User not found.");
        return member;
      }
      default: throw new Error("Invalid type.");
    }
  }
}

exports.run = async (client, msg, [type, ...search]) => {
  const run = new Run(msg);
  search = search.length ? search.join(" ") : null;
  await run.Start(type, search);
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: [],
  permLevel: 1,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 2,
  cooldown: 5,
};

exports.help = {
  name: "util",
  description: "Command Description",
  usage: "<members|channel|server|flow|permissions|perms> [search:string] [...]",
  usageDelim: " ",
  extendedHelp: "",
};

const PermissionFlags = {
  0: "Create instant invite",
  4: "Manage channel",
  28: "Manage permissions",
  29: "Manage webhooks",

  10: "Read messages",
  11: "Send messages",
  12: "Send TTS messages",
  13: "Manage messages",
  14: "Embed links",
  15: "Attach files",
  16: "Read message history",
  17: "Mention everyone",
  18: "Use external emojis",
  6: "Add reactions",

  20: "Connect",
  21: "Speak",
  22: "Mute members",
  23: "Deafen members",
  24: "Move members",
  25: "Use voice activity",
};

function toBinary(n, type) {
  let out = "";
  const binary = n.toString(2);
  let ind;

  if (binary === 0) return "None";

  for (let s = 0; s < binary.length; s++) {
    if (binary.charAt(s) === "1") {
      ind = binary.length - s - 1;
      out += `\n\u200B     ${type === "+" ? "🔹" : "🔸"} ${PermissionFlags[ind]}`;
    }
  }
  return out;
}

const roleMembers = async (client, msg, role) => {
  if (!role.members.size) throw new Error("This role has no members.");
  const members = role.members.map(member => `\`${member.id}\` ❯ ${member.user.tag}`);
  const list = members.join("\n");
  const embed = new client.methods.Embed()
    .setColor(msg.member.highestRole.color || 0xdfdfdf)
    .setFooter(client.user.username, client.user.displayAvatarURL)
    .setTitle(`List of members for ${role.name} (${role.id})`);
  if (list.length < 2000) { embed.setDescription(list); } else {
    const splitted = client.methods.splitMessage(list, { char: "\n", maxLength: 1000 });
    splitted.forEach(text => embed.addField("\u200B", text));
  }
  await msg.sendEmbed(embed);
};

const moment = require("moment");

const channelInfo = async (client, msg, channel) => {
  const roleInfo = channel.permissionOverwrites.map((m) => { // eslint-disable-line arrow-body-style
    const type = m.type === "role" ? msg.guild.roles.get(m.id) : msg.guild.members.get(m.id);
    return `• ${type} (${m.type}) has the permissions:${m.allow !== 0 ? toBinary(m.allow, "+") : ""}${m.deny !== 0 ? toBinary(m.deny, "-") : ""}`;
  }).join("\n\n");
  const embed = new client.methods.Embed()
    .setColor(msg.member.highestRole.color || 0xdfdfdf)
    .setDescription(`Info on **${channel.name}** (ID: ${channel.id})`)
    .addField("❯ Channel info", client.indents`
      • **Type:** ${channel.type}
      • **Created at:** ${moment.utc(channel.createdAt).format("D/MM/YYYY [at] HH:mm:ss")}
      • **Position:** ${channel.position}
      ${channel.type === "text" ?
      `• **Topic:** ${channel.topic === "" ? "Not set" : channel.topic}` :
      `• **Bitrate:** ${channel.bitrate}\n• **User limit:** ${channel.userLimit}`}
    `)
    .setThumbnail(msg.guild.iconURL() || null)
    .setTimestamp();
  const splitted = client.methods.splitMessage(roleInfo, { char: "\n", maxLength: 1000 });
  if (typeof splitted === "string") embed.addField("\u200B", splitted);
  else splitted.forEach(text => embed.addField("\u200B", text));

  await msg.sendEmbed(embed);
};

const humanLevels = {
  0: "None",
  1: "Low",
  2: "Medium",
  3: "(╯°□°）╯︵ ┻━┻",
};

const guildInfo = async (client, msg, guild) => {
  const emojis = guild.emojis.array().join(" ");
  const offline = guild.members.filter(m => m.user.presence.status === "offline");
  const online = guild.members.filter(m => m.user.presence.status !== "offline");
  const channels = [];
  channels.push(`• **${guild.channels.filter(ch => ch.type === "text").size}** Text, **${guild.channels.filter(ch => ch.type === "voice").size}** Voice`);
  channels.push(`• Default: **${guild.defaultChannel}**`);
  channels.push(`• AFK: ${guild.afkChannelID ?
    `**<#${guild.afkChannelID}>** after **${guild.afkTimeout / 60}**min` :
    "**None.**"}`);
  const member = [];
  member.push(`• **${guild.memberCount}** members`);
  member.push(`• Owner: **${guild.owner.user.username}#${guild.owner.user.discriminator}**`);
  member.push(`(ID: **${guild.ownerID}**)`);
  const other = [];
  other.push(`• Roles: **${guild.roles.size}**`);
  other.push(`• Region: **${guild.region}**`);
  other.push(`• Created at: **${moment.utc(guild.createdAt).format("dddd, MMMM Do YYYY, HH:mm:ss")}** (UTC)`);
  other.push(`• Verification Level: **${humanLevels[guild.verificationLevel]}**`);
  const users = [];
  users.push(`• Online/Offline users: **${online.size}**/**${offline.size}** (${Math.round((100 * online.size) / guild.memberCount)}% users online)`);
  users.push(`• **${guild.members.filter(m => m.joinedAt > msg.createdTimestamp - 86400000).size}** new users within the last 24h.`);
  const embed = new client.methods.Embed()
    .setColor(msg.member.highestRole.color || 0xdfdfdf)
    .setDescription(`Info on **${guild.name}** (ID: **${guild.id}**)\n\u200B`)
    .setThumbnail(guild.iconURL() || null)
    .addField("❯ Channels", channels.join("\n"), true)
    .addField("❯ Member", member.join("\n"), true)
    .addField("❯ Other", other.join("\n"), true)
    .addField("❯ Users", users.join("\n"), true);
  if (emojis) {
    const splitted = client.methods.splitMessage(emojis, { char: " ", maxLength: 1000 });
    const emojiTitle = ["❯ Emojis", "\u200B"];
    if (typeof splitted === "string") embed.addField("❯ Emojis", splitted);
    else splitted.forEach((text, index) => embed.addField(emojiTitle[index], text, true));
  }

  await msg.sendEmbed(embed);
};

const channelFlow = async (client, msg, channel) => {
  if (!channel.readable) client.funcs.throwError(client, "I can't read this channel.", msg.channel);
  const messages = await channel.fetchMessages({ limit: 100 });
  const amount = messages.filter(m => m.createdTimestamp > (msg.createdTimestamp - 60000)).size;
  await msg.send(`Dear ${msg.author}, ${amount} messages have been sent within the last minute.`);
};

const permissionUser = async (client, msg, member) => {
  const perms = member.permissions.serialize();
  const perm = ["\u200B"];
  for (const key in perms) perm.push(`${perms[key] ? "\\🔹" : "\\🔸"} **${client.funcs.toTitleCase(key.replace(/\_/g, " "))}**`); // eslint-disable-line

  const embed = new client.methods.Embed()
    .setColor(msg.guild.members.get(member.user.id).highestRole.color || 0xdfdfdf)
    .setTitle(`Permissions for ${member.user.tag} (${member.user.id})`)
    .setDescription(perm);
  await msg.sendEmbed(embed);
};
