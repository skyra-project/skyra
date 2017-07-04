const ModLog = require("../../utils/createModlog.js");

exports.run = async (client, msg, [user, ...reason]) => {
    const member = await msg.guild.fetchMember(user.id).catch(() => { throw "this user is not in this server"; });

    if (user.id === msg.author.id) throw "you can't unmute yourself...";
    else if (member.highestRole.position >= msg.member.highestRole.position) throw "the selected member has higher or equal role position than you.";

    const configs = msg.guild.settings;
    if (!configs) throw "you caught me while creating the configuration for this server.";

    const mute = configs.roles.muted;
    if (!configs.roles.muted) throw "there's no mute role configured.";

    const muteRole = msg.guild.roles.get(mute);
    if (!muteRole) throw "you configured a mute role, but you deleted it when I was not ready.";

    const mutedUser = await msg.guild.settings.moderation.getMute(user.id);
    if (!mutedUser) throw "this user is not muted.";

    const roles = mutedUser.extraData || [];

    reason = reason.length ? reason.join(" ") : null;
    await member.edit({ roles });
    msg.send(`|\`🔨\`| **UNMUTED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ""}`).catch(e => client.emit("log", e, "error"));
    const moderation = new ModLog(msg.guild)
        .setModerator(msg.author)
        .setUser(user)
        .setType("unmute")
        .setReason(reason);

    return moderation.send();
};

exports.conf = {
    enabled: true,
    runIn: ["text"],
    aliases: [],
    permLevel: 2,
    botPerms: ["MANAGE_ROLES"],
    requiredFuncs: [],
    spam: false,
    mode: 2,
    cooldown: 5,
};

exports.help = {
    name: "unmute",
    description: "Unmute the mentioned user.",
    usage: "<SearchMember:user> [reason:string] [...]",
    usageDelim: " ",
};
