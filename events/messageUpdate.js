const { Event } = require('../index');
const { MessageEmbed, Util } = require('discord.js');
const { diffWords } = require('diff');

module.exports = class extends Event {

    async run(old, msg) {
        if (old.content === msg.content) return null;
        this.client.emit('message', msg);

        if (msg.channel.type !== 'text' || msg.author.id === this.client.user.id)
            return null;

        const settings = await msg.guild.settings;
        if (settings.events.messageEdit && settings.channels.messagelogs)
            return this.sendLog(old, msg, settings)
                .catch(err => this.client.emit('log', err, 'error'));

        return null;
    }

    async sendLog(old, msg, settings) {
        const channel = msg.guild.channels.get(settings.channels.messagelogs);
        if (!channel)
            return settings.update({ channels: { messagelogs: null } });

        const result = diffWords(Util.escapeMarkdown(old.content), Util.escapeMarkdown(msg.content));
        let text = '';
        for (let i = 0; i < result.length; i++) {
            if (result[i].added === true) text += `**${result[i].value}**`;
            else if (result[i].removed === true) text += `~~${result[i].value}~~`;
            else text += result[i].value;
        }

        const i18n = msg.language;

        const embed = new MessageEmbed()
            .setColor(0xDCE775)
            .setAuthor(`${msg.author.tag} (${msg.author.id})`, msg.author.displayAvatarURL())
            .splitFields(text)
            .setFooter(`${i18n.get('EVENTS_MESSAGE_UPDATE')} | ${msg.channel.name}`)
            .setTimestamp();

        return channel.send({ embed });
    }

};
