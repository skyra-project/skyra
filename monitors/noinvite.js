exports.conf = {
    enabled: true,
};

exports.run = (client, msg) => {
    if (msg.channel.type !== "text") return;
    const configs = msg.guild.configs;

    if (!configs.selfmod.inviteLinks) return;
    if (!(/(discord\.(gg|io|me|li)\/.+|discordapp\.com\/invite\/.+)/i.test(msg.content))) return;
    if (msg.hasAtleastPermissionLevel(2)) return;

    if (msg.deletable) {
        msg.delete();
        msg.alert(`Dear ${msg.author} |\`❌\`| Invite links aren't allowed here.`);
    }

    const modLogChannel = configs.channels.mod;
    if (!modLogChannel) return;

    const embed = new client.methods.Embed()
    .setColor(0xefae45)
    .setAuthor(`${msg.author.tag} (${msg.author.id})`, msg.author.displayAvatarURL({ size: 128 }))
    .setFooter(`#${msg.channel.name} | Invite link`)
    .setTimestamp();

    msg.guild.channels.get(modLogChannel).send({ embed });
};
