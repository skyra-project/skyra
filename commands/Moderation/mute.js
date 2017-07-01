const MODERATION = require("../../utils/managerModeration");
const ASSETS = require("../../utils/assets");

exports.configuration = async (client, msg) => {
    const configuration = msg.guild.settings;
    if (!configuration.roles.muted) {
        await msg.Prompt("Do you want to create and configure the Mute role right now?")
      .catch(() => { throw "Mute role creation cancelled."; });
        await msg.send("`Processing...`");
        return ASSETS.createMuted(msg);
    }
    return msg.guild.roles.get(configuration.roles.muted);
};

/* eslint-disable no-underscore-dangle */
exports.run = async (client, msg, [user, ...reason]) => {
    const member = await msg.guild.fetchMember(user.id).catch(() => { throw "this user is not in this server"; });

    if (user.id === msg.author.id) throw "why would you mute yourself?";
    else if (member.highestRole.position >= msg.member.highestRole.position) throw "the selected member has higher or equal role position than you.";

    return this.configuration(client, msg)
    .then(async (mute) => {
        if (msg.guild.settings.mutes.has(user.id)) throw "this user is already muted.";

        reason = reason.length ? reason.join(" ") : null;
        const roles = member._roles;
        await member.edit({ roles: [mute.id] });
        msg.send(`|\`🔨\`| **MUTED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ""}`).catch(e => client.emit("log", e, "error"));
        return MODERATION.send(client, msg, user, "mute", reason, roles);
    })
    .catch(e => msg.alert(e));
};

exports.conf = {
    enabled: true,
    runIn: ["text"],
    aliases: [],
    permLevel: 1,
    botPerms: ["MANAGE_ROLES"],
    requiredFuncs: [],
    spam: false,
    mode: 2,
    cooldown: 5,
};

exports.help = {
    name: "mute",
    description: "Mute the mentioned user.",
    usage: "<SearchMember:user> [reason:string] [...]",
    usageDelim: " ",
};
