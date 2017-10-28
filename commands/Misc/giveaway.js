const { Command, Timer } = require('../../index');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['gstart'],
            botPerms: ['EMBED_LINKS', 'ADD_REACTIONS'],

            cooldown: 10,

            usage: '<time:string> <title:string> [...]',
            usageDelim: ' ',
            description: 'Start new giveaways.'
        });
    }

    async run(msg, [time, ...rawTitle], settings, i18n) {
        const title = rawTitle.length > 0 ? rawTitle.join(' ') : null;
        const timer = new Timer(time);
        if (timer.Duration < 60000)
            throw i18n.get('GIVEAWAY_TIME');

        const embed = new MessageEmbed()
            .setColor(0x49C6F7)
            .setTitle(title)
            .setDescription(i18n.get('GIVEAWAY_DURATION', timer.Duration))
            .setFooter(i18n.get('GIVEAWAY_ENDS_AT'))
            .setTimestamp(timer.Date);
        const message = await msg.channel.send(i18n.get('GIVEAWAY_TITLE'), { embed }).catch(() => null);
        if (message === null)
            return null;

        await message.react('🎉').catch(() => null);

        const id = await this.client.handler.clock.create({
            type: 'giveaway',
            timestamp: timer.Duration + Date.now() - 20000,
            guild: msg.guild.id,
            channel: msg.channel.id,
            message: message.id,
            user: msg.author.id,
            title
        }).catch(Command.handleError);

        await msg.author.send(i18n.get('GIVEAWAY_START_DIRECT_MESSAGE', title, id)).catch(() => null);

        return message;
    }

};
