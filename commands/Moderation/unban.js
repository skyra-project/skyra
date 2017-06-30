const MODERATION = require("../../utils/managerModeration");

const fetchBan = (guild, query) => new Promise(async (resolve, reject) => {
    const users = await guild.fetchBans();
    const member = users.find(m => m.user.id === query) ||
    users.find(m => m.user.tag === query) ||
    users.find(m => m.user.username.toLowerCase() === query) ||
    users.find(m => m.user.username.toLowerCase().startsWith(query)) ||
    reject("User not found.");
    resolve(member);
});

exports.run = async (client, msg, [query, ...reason]) => {
    const user = await fetchBan(msg.guild, query);

    reason = reason.length ? reason.join(" ") : null;
    user.action = "unban";
    await msg.guild.unban(user, reason);
    msg.send(`|\`🔨\`| **UNBANNED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ""}`).catch(e => client.emit("log", e, "error"));
    await MODERATION.send(client, msg, user, "unban", reason);
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
    name: "unban",
    description: "Unbans an user (you MUST write his name or his ID).",
    usage: "<user:string> [reason:string] [...]",
    usageDelim: " ",
};
