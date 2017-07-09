exports.conf = {
    guildOnly: true,
    enabled: true,
};

exports.run = async (client, msg, settings) => {
    if (!settings.selfmod.inviteLinks
        || !(/(?:discord\.(?:gg|io|me|li)|discordapp\.com\/invite)\/.+/i.test(msg.content))
        || msg.hasLevel(1)) return false;

    if (msg.deletable) {
        await msg.delete();
        await msg.alert(`Dear ${msg.author} |\`❌\`| Invite links aren't allowed here.`);
    }

    if (!settings.channels.mod) return null;

    const embed = new client.methods.Embed()
        .setColor(0xefae45)
        .setAuthor(`${msg.author.tag} (${msg.author.id})`, msg.author.displayAvatarURL({ size: 128 }))
        .setFooter(`#${msg.channel.name} | Invite link`)
        .setTimestamp();

    return msg.guild.channels.get(settings.channels.mod).send({ embed });
};
