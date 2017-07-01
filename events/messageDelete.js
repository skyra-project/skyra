const { copyPaste } = require("../functions/wrappers");

exports.run = (client, msg) => {
    if (msg.channel.type === "text"
        && msg.author.id === client.user.id
        && msg.embeds.length === 1
        && msg.guild.settings.channels.mod
        && msg.guild.settings.events.modLogProtection
        && msg.channel.id === msg.guild.settings.channels.mod) copyPaste(msg);
};
