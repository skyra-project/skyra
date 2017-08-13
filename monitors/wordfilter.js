const { Monitor } = require('../index');
const { RichEmbed } = require('discord.js');

module.exports = class extends Monitor {

    constructor(...args) {
        super(...args, {
            guildOnly: true,
            ignoreBots: false
        });
    }

    async run(msg, settings) {
        if (settings.filter.level === 0 ||
            settings.filter.regexp === null ||
            msg.hasLevel(1) ||
            !settings.filter.regexp.test(msg.content)) return false;

        if (msg.deletable) await msg.delete()
            .catch(err => this.client.emit('log', err, 'error'));
        if (settings.filter.level === 1 || settings.filter.level === 3) {
            msg.send(`Pardon, dear ${msg.author}, you said something that is not allowed here.`)
                .catch(err => this.client.emit('log', err, 'error'));
        }

        if (settings.filter.level !== 2 && settings.filter.level !== 3) return true;

        const modLogChannelID = settings.channels.mod;
        if (!modLogChannelID) return true;

        const channel = msg.guild.channels.get(modLogChannelID);
        if (!channel) return settings.update({ channels: { mod: null } });

        const embed = new RichEmbed()
            .setColor(0xefae45)
            .setAuthor(`${msg.author.tag} (${msg.author.id})`, msg.author.displayAvatarURL({ size: 128 }))
            .setFooter(`#${msg.channel.name} | Filtered Word ${settings.filter.regexp.exec(msg.content)[0]}`)
            .setTimestamp();

        return channel.send({ embed });
    }

};
