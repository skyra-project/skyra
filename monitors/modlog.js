exports.conf = {
    guildOnly: true,
    enabled: true
};

exports.run = async (client, msg, settings) => {
    if (settings.events.modLogProtection === true &&
        settings.channels.mod &&
        msg.channel.id === settings.channels.mod) return msg.nuke();
    return null;
};
