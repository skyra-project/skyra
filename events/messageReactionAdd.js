const { Event } = require('../index');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

    constructor(...args) {
        super(...args);

        this.cache = new Map();
    }

    async run(reaction, user) {
        if (!this.client.ready
            || reaction.message.channel.type !== 'text'
            || reaction.emoji.name !== '⭐') return null;

        const msg = reaction.message;
        const settings = await msg.guild.settings;

        if (settings.starboard.channel === null
            || reaction.message.channel.id === settings.starboard.channel)
            return null;

        const starboard = msg.guild.channels.get(settings.starboard.channel);
        if (!starboard || starboard.postable === false)
            return settings.update({ starboard: { channel: null } })
                .catch(error => this.client.emit('log', error, 'wtf'));

        const i18n = this.client.languages.get(settings.master.language);

        if (msg.author.id === user.id)
            return msg.channel.send(i18n.get('EVENTS_STARBOARD_SELF', user))
                .then(message => message.nuke(10000));
        if (msg.author.bot)
            return msg.channel.send(i18n.get('EVENTS_STARBOARD_BOT', user))
                .then(message => message.nuke(10000));
        if (msg.content === '' && msg.attachments.size === 0)
            return msg.channel.send(i18n.get('EVENTS_STARBOARD_EMPTY', user))
                .then(message => message.nuke(10000));

        const star = this.getStar(msg);

        if (star.users.has(user.id))
            return null;

        const amount = star.users.add(user.id).size;

        if (star.message) {
            return star.message.edit(`${this.getStarIcon(amount)} **${amount}** ${msg.channel} ID: ${msg.id}`, { embed: star.embed })
                .catch(error => this.client.emit('log', error, 'wtf'));
        }

        if (amount < settings.starboard.minimum)
            return null;

        return starboard.send(`${this.getStarIcon(amount)} **${amount}** ${msg.channel} ID: ${msg.id}`, { embed: star.embed })
            .then(message => { star.message = message; })
            .catch(error => this.client.emit('log', error, 'wtf'));
    }

    getStar(msg) {
        return this.cache.get(`${msg.channel.id}-${msg.id}`) || this.createStar(msg);
    }

    getStarIcon(amount) {
        if (amount < 5) return '⭐';
        if (amount < 10) return '🌟';
        return '💫';
    }

    createStar(msg) {
        const embed = new MessageEmbed()
            .setColor(15844367)
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
            .setDescription(msg.content)
            .setFooter(`#${msg.channel.name} | ${msg.id}`)
            .setTimestamp();

        const file = this.getFile(msg);
        if (file !== null)
            embed.setImage(file);

        this.cache.set(`${msg.channel.id}-${msg.id}`, {
            embed,
            users: new Set(),
            message: null
        });

        setTimeout(() => this.cache.delete(`${msg.channel.id}-${msg.id}`),
            (this.client.options.messageCacheLifetime * 1000) + (this.client.options.messageSweepInterval * 1000));

        return this.cache.get(`${msg.channel.id}-${msg.id}`);
    }

    getFile(msg) {
        if (msg.attachments.size === 0) return null;
        const attachment = msg.attachments.first();
        return /\.(jpg|jpeg|png|gif)$/.test(attachment.url) ? attachment.url : null;
    }

};
