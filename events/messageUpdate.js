const { Event } = require('../index');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

    run(old, msg) {
        if (old.content === msg.content) return null;
        this.client.emit('message', msg);

        if (msg.channel.type !== 'text' || msg.author.id === this.client.user.id) return null;

        const settings = msg.guild.settings;
        if (settings.events.messageEdit && settings.channels.log) return this.sendLog(old, msg, settings)
            .catch(err => this.handleError(err));
        return null;
    }

    async sendLog(old, msg, settings) {
        const channel = msg.guild.channels.get(settings.channels.log);
        if (!channel) return settings.update({ channels: { log: null } });

        const i18n = msg.language;

        const embed = new MessageEmbed()
            .setColor(0xDCE775)
            .setAuthor(`${msg.author.tag} (${msg.author.id})`, msg.author.displayAvatarURL())
            .setDescription(i18n.get('EVENTS_MESSAGE_UPDATE_MSG', old.content, msg.content))
            .setFooter(i18n.get('EVENTS_MESSAGE_UPDATE'))
            .setTimestamp();

        return channel.send({ embed });
    }

    handleError(err) {
        return this.client.emit('log', err, 'error');
    }

};
