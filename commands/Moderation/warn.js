const ModLog = require("../../utils/createModlog.js");

exports.run = async (client, msg, [user, ...reason]) => {
    const member = await msg.guild.fetchMember(user.id).catch(() => { throw "this user is not in this server"; });

    if (user.id === msg.author.id) throw "why would you warn yourself?";
    else if (user.id === client.user.id) throw "ew...";
    else if (member.highestRole.position >= msg.member.highestRole.position) throw "the selected member has higher or equal role position than you.";

    reason = reason.length ? reason.join(" ") : null;
    msg.send(`|\`🔨\`| **WARNED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ""}`).catch(e => client.emit("log", e, "error"));
    const moderation = new ModLog(msg.guild)
        .setModerator(msg.author)
        .setUser(user)
        .setType("warn")
        .setReason(reason);

    return moderation.send();
};

exports.conf = {
    enabled: true,
    runIn: ["text"],
    aliases: ["warning", "strike"],
    permLevel: 1,
    botPerms: [],
    requiredFuncs: [],
    spam: false,
    mode: 2,
    cooldown: 5,
};

exports.help = {
    name: "warn",
    description: "Strike the mentioned user.",
    usage: "<SearchMember:user> [reason:string] [...]",
    usageDelim: " ",
};
