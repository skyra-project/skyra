const { Finalizer } = require('../index');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Finalizer {

    run(msg) {
        if (msg.channel.type !== 'text') return null;

        const settings = msg.guild.settings;
        if (settings.events.commands && settings.channels.log) return this.sendLog(msg, settings);

        return null;
    }

    async sendLog(msg, settings) {
        const channel = msg.guild.channels.get(settings.channels.log);
        if (!channel) return settings.update({ channels: { log: null } });

        const i18n = msg.guild.language;

        const embed = new MessageEmbed()
            .setColor(0xDCE775)
            .setAuthor(`${msg.author.tag} (${msg.author.id})`, msg.author.displayAvatarURL())
            .setFooter(i18n.get('EVENTS_COMMAND', msg.cmd.name))
            .setTimestamp();

        return channel.send({ embed });
    }

};
