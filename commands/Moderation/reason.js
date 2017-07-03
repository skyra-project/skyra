const sanitizeEmbed = require("../../functions/embed");

exports.validate = async (client, msg, index) => {
    const cases = await msg.guild.settings.moderation.getCases();
    if (!cases) throw "i couldn't find mod-logs here. Please perform a moderation action before doing this.";

    const sCase = cases[index];
    if (!sCase) throw "this case does not exist.";
    if (sCase.reason && sCase.moderator !== msg.author.id && !msg.hasLevel(3)) throw "for security, only the moderator who performed this action, or an administrator, can edit this case.";

    return sCase;
};

exports.fetchMessage = async (client, msg, document) => {
    const modLog = msg.guild.settings.channels.mod;
    if (!modLog) throw "there is no modlog channel configured.";
    const channel = msg.guild.channels.get(modLog);
    if (!channel) {
        await msg.guild.settings.update({ channels: { mod: null } });
        throw "invalid configuration. Please set a correct modlog channel";
    }
    const message = await channel.fetchMessage(document.message);
    return { message, channel };
};

exports.handleMessage = async (client, msg, message, channel, document, reason) => {
    if (!message) {
        const user = await client.fetchUser(document.user);
        const moderation = new client.Moderation(msg);
        return moderation.send(user, "ban", reason);
    }
    const embed = sanitizeEmbed(message.embeds[0]);
    embed.author = { name: msg.author.username, icon_url: msg.author.displayAvatarURL({ size: 128 }) };
    const description = embed.description.split("\n");
    description[2] = `❯ **Reason:** ${reason}`;
    embed.description = description.join("\n");
    return message.edit({ embed });
};

exports.run = async (client, msg, [index, ...reason]) => {
    reason = reason.length ? reason.join(" ") : null;
    if (!reason) throw "you must set a reason.";

    const sCase = await this.validate(client, msg, index);
    const obj = await this.fetchMessage(client, msg, sCase);
    await this.handleMessage(client, msg, obj.message, obj.channel, sCase, reason);

    await msg.guild.settings.moderation.updateCase(index, { reason, moderator: msg.author.id });

    return msg.alert(`**Success!** New reason: ${reason}`);
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
    cooldown: 5,
};

exports.help = {
    name: "reason",
    description: "Add or change a reason for a Modlog.",
    usage: "<case:int> <reason:string> [...]",
    usageDelim: " ",
};
