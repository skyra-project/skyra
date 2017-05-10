const moment = require("moment");

/* eslint-disable consistent-return, no-confusing-arrow, complexity */
exports.run = async (client, msg, [type, ...input]) => {
  input = input.length ? input.join(" ") : null;
  const embed = new client.methods.Embed()
    .setColor(msg.color)
    .setFooter(client.user.username, client.user.displayAvatarURL);

  switch (type.toLowerCase()) {
    case "channels": {
      embed.setTitle(`List of channels for ${msg.guild} (${msg.guild.id})`)
        .setDescription(msg.guild.channels
          .filter(ch => ch.type === "text")
          .array()
          .sort((a, b) => a.position > b.position ? 1 : -1)
          .map(c => ` ❯ **${c.name}** **\`<#${c.id}>\`**`)
          .join("\n"));
      break;
    }
    case "roles": {
      const roleList = msg.guild.roles
        .array()
        .sort((a, b) => a.position > b.position ? 1 : -1)
        .slice(1)
        .reverse()
        .map(c => `❯ \`${"_".repeat(3 - c.members.size.toString().length)}${c.members.size}\` ❯ **${c.name}** ❯ *${c.id}*`)
        .join("\n");
      embed.setTitle(`List of roles for ${msg.guild} (${msg.guild.id})`);
      if (roleList.length <= 2040) { embed.setDescription(roleList); } else {
        let init = roleList;
        let i;
        let x;

        for (i = 0; i < roleList.length / 1020; i++) {
          x = init.substring(0, 1020).lastIndexOf("\n");
          embed.addField("\u200B", init.substring(0, x));
          init = init.substring(x, init.length);
        }
      }
      break;
    }
    case "invites": {
      if (!msg.guild.member(client.user).hasPermission("MANAGE_GUILD")) {
        msg.channel.send("|`❌`| **ERROR**: Not enough permissions.").then(m => m.delete(10000));
        return;
      }
      const invites = await msg.guild.fetchInvites();
      if (!invites.first()) return msg.channel.send("There's no invite link here.").then(m => m.delete(10000));
      embed.setTitle("List of invites")
        .setDescription(invites
          .array()
          .sort((a, b) => a.uses < b.uses ? 1 : -1)
          .map(inv => `🔻 ${inv.channel} ❯ ${inv.inviter}\n      ❯ \`${inv.code}\` Uses: (${inv.uses})`)
          .join("\n"));
      break;
    }
    case "strikes": {
      if (!input) throw new Error("You must provide a user.");
      /* Initialize Search */
      const user = await client.search.User(input.join(" "), msg.guild);

      if (!user) return msg.channel.send(`User not found: \`${input}\``);
      const thisStrikes = client.configs.get(msg.guild.id).strikes.filter(u => u.user === user.id);
      if (thisStrikes.filter(u => u.appealed === 0).size === 0) {
        return msg.channel.send(`Dear ${msg.author}, this user has **0** strikes${
        thisStrikes.filter(u => u.appealed === 1).size ?
          ` and **${thisStrikes.filter(u => u.appealed === 1).size}** warnings appealed.` :
          ""}`);
      }
      embed.setTitle(`All strikes for the user ${user.username} (${user.id})`)
        .setDescription(`${thisStrikes
          .filter(u => u.appealed === 0)
          .map(s => client.indents`
            [ID: **${s.caseID}**] **Striked at**: *${moment.utc(parseInt(s.timestamp)).format("dddd, MMMM Do YYYY, HH:mm:ss")}* (UTC)
            **Striked by**: *${msg.guild.members.get(s.moderator) ? msg.guild.members.get(s.moderator).user.username : s.moderator}*
            **Reason**: *${s.reason}*
          `)
          .join("\n\u200B\n")}${
            thisStrikes.filter(u => u.appealed === 1).size ?
            `\n\u200B\n**${thisStrikes.filter(u => u.appealed === 1).size}** warnings appealed.` :
            ""
          }`);
      break;
    }
    case "track": {
      const channels = msg.guild.channels.filter(m => m.tracker);
      if (channels.size === 0) return msg.channel.send(`Dear ${msg.author}, there aren't any currently trackers`);
      embed.setTitle(`List of (${channels.size}) trackers.`)
        .setDescription(channels
          .map(l => `(${moment
            .duration(msg.createdAt - l.trackertimer)
            .format("m [mins], s [secs]")}) ${l} is being tracked by ${msg.guild.members.get(l.tracker)}
          `)
          .join("\n"));
      break;
    }
    default:
    // no default
  }

  await msg.sendEmbed(embed);
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: [],
  permLevel: 2,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 2,
  cooldown: 15,
};

exports.help = {
  name: "list",
  description: "Check all channels from this server.",
  usage: "<channels|roles|invites|strikes|track> [input:str] [...]",
  usageDelim: " ",
};
