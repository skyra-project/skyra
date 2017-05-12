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
      if (roleList.length <= 2040) embed.setDescription(roleList);
      else {
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
      if (!msg.guild.me.hasPermission("MANAGE_GUILD")) throw new Error("Not enough permissions.");

      const invites = await msg.guild.fetchInvites();
      if (!invites.first()) return msg.alert("There's no invite link here.");
      embed.setTitle("List of invites")
        .setDescription(invites
          .array()
          .sort((a, b) => a.uses < b.uses ? 1 : -1)
          .map(inv => `🔻 ${inv.channel} ❯ ${inv.inviter}\n      ❯ \`${inv.code}\` Uses: (${inv.uses})`)
          .join("\n"));
      break;
    }
    case "warnings":
    case "strikes": {
      const cases = await msg.guild.moderation.cases.then(d => d.filter(c => c.type === "warn"));
      if (!input) {
        embed
          .setTitle("List of strikes.")
          .setDescription(`${!cases.length ? "There's no strike." : `There are ${cases.length} strikes. Cases: **${cases
            .map(c => c.thisCase)
            .join("**, **")}**`}`);
      } else {
        const user = await client.search.User(input, msg.guild);
        const thisStrikes = cases.filter(c => c.user === user.id);

        embed
          .setTitle(`List of strikes for ${user.tag}`)
          .setDescription(`${!thisStrikes.length ? `There's no strike for ${user.tag}.` : `There are ${thisStrikes.length} strike(s):\n\n${thisStrikes
            .map(c => `Case \`${c.thisCase}\`. Moderator: **${client.users.has(c.moderator) ? client.users.get(c.moderator).tag : c.moderator}**\n\`${c.reason}\``)
            .join("\n\n")}`}`);
      }
      break;
    }
    case "track": {
      const channels = msg.guild.channels.filter(m => m.tracker);
      if (channels.size === 0) return msg.alert(`Dear ${msg.author}, there aren't any currently trackers`);
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
  usage: "<channels|roles|invites|warnings|strikes|track> [input:str] [...]",
  usageDelim: " ",
};
