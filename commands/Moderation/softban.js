const MODERATION = require("../../utils/managerModeration");

exports.run = async (client, msg, [user, days = 7, ...reason]) => {
    const member = await msg.guild.fetchMember(user.id).catch(() => { throw "this user is not in this server"; });

    if (user.id === msg.author.id) throw "why would you ban yourself?";
    else if (user.id === client.user.id) throw "ew...";
    else if (member.highestRole.position >= msg.member.highestRole.position) throw "the selected member has higher or equal role position than you.";
    else if (!member.kickable) throw "the selected member is not bannable.";

    reason = reason.length ? reason.join(" ") : null;
    user.banFilter = true;
    await msg.guild.ban(user, { days, reason: `${reason ? `Softban with reason: ${reason}` : null}` });
    await msg.guild.unban(user, "Softban.");
    msg.send(`|\`🔨\`| **SOFTBANNED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ""}`).catch(e => client.emit("log", e, "error"));
    await MODERATION.send(client, msg, user, "softban", reason);
};

exports.conf = {
    enabled: true,
    runIn: ["text"],
    aliases: [],
    permLevel: 2,
    botPerms: ["BAN_MEMBERS"],
    requiredFuncs: [],
    spam: false,
    mode: 2,
    cooldown: 5,
};

exports.help = {
    name: "softban",
    description: "Softban the mentioned user.",
    usage: "<SearchMember:user> [days:int] [reason:string] [...]",
    usageDelim: " ",
};
