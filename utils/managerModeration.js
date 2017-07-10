const colour = {
    ban: 0xFF0200,
    unban: 0xFF4443,
    softban: 0xFF1A44,
    kick: 0xFFE604,
    mute: 0xFF6E23,
    unmute: 0xFF8343,
    warn: 0xFF8F2A,
    unwarn: 0xFF9C43,
};

exports.unknown = async (client, guild, user, type) => {
    if (!guild.settings.exists) guild.settings.create();
    if (user.action === type) {
        delete user.action;
        return;
    }
    const channel = this.getChannel(guild);
    if (!channel) return;
    const thisCase = await guild.settings.moderation.getAmountCases();
    const description = this.generate(client, user, type, null, thisCase, guild.settings.prefix);
    const embed = this.createEmbed(client, type, null, description, thisCase, true);
    const thisMessage = await channel.send({ embed });
    await guild.settings.moderation.pushCase(type, null, null, user, thisMessage.id, null);
};

exports.send = (client, msg, user, type, reason = null, extraData = null) => {
    if (!msg.guild.settings.exists) msg.guild.settings.create();
    else this.justified(client, msg, user, type, reason, extraData).catch(e => client.emit("log", e, "error"));
};

exports.justified = async (client, msg, user, type, reason, extraData) => {
    const channel = this.getChannel(msg.guild);
    let thisMessage;
    if (channel) {
        /* Parse reason */
        if (reason instanceof Array) {
            if (!reason.length) reason = null;
            else reason = reason.join(" ");
        }

        const thisCase = await msg.guild.settings.moderation.getAmountCases();
        const description = this.generate(client, user, type, reason, thisCase, msg.guild.settings.prefix);
        const embed = this.createEmbed(client, type, msg.author, description, thisCase, false);
        thisMessage = await channel.send({ embed });
    }
    await msg.guild.settings.moderation.pushCase(
        type,
        msg.author.id,
        reason,
        user,
        thisMessage ? thisMessage.id : null,
        extraData,
    );
};

exports.getChannel = guild => guild.settings.channels.mod ? guild.channels.get(guild.settings.channels.mod) : false; // eslint-disable-line no-confusing-arrow

exports.createEmbed = (client, type, moderator, description, thisCase, AUTO) => {
    if (AUTO) moderator = client.user;
    const embed = new client.methods.Embed()
        .setColor(colour[type])
        .setAuthor(moderator.username, moderator.displayAvatarURL({ size: 128 }))
        .setDescription(description)
        .setFooter(`${AUTO ? "AUTO | " : ""}Case ${thisCase}`, client.user.displayAvatarURL({ size: 128 }))
        .setTimestamp();
    return embed;
};

const toTitleCase = require("../functions/toTitleCase");

exports.generate = (client, user, type, reason, thisCase, prefix) => [
    `❯ **Action:** ${toTitleCase(type)}`,
    `❯ **User:** ${user.tag} (${user.id})`,
    `❯ **Reason:** ${reason || `Please use \`${prefix}reason ${thisCase} to claim.\``}`,
].join("\n");
