const { Command } = require('../../index');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            botPerms: ['EMBED_LINKS'],
            mode: 2,
            cooldown: 10,

            usage: '<message:string{17,21}> [channel:channel]',
            usageDelim: ' ',
            description: "Quote another people's message."
        });
    }

    async run(msg, [searchMessage, channel = msg.channel], settings, i18n) {
        if (/[0-9]{17,21}/.test(searchMessage) === false)
            throw i18n.get('RESOLVER_INVALID_MSG', 'Message');

        const mes = await channel.messages.fetch(searchMessage)
            .catch(() => { throw i18n.get('SYSTEM_MESSAGE_NOT_FOUND'); });

        const attachment = mes.attachments.size
            ? mes.attachments.find(att => /jpg|png|webp|gif/.test(att.url.split('.').pop()))
            : null;

        if (attachment === null && mes.content === '') throw i18n.get('COMMAND_QUOTE_MESSAGE');

        const embed = new MessageEmbed()
            .setAuthor(mes.author.tag, mes.author.displayAvatarURL({ size: 128 }))
            .setDescription(mes.content)
            .setImage(attachment ? attachment.url : null)
            .setTimestamp(mes.createdAt);

        return msg.send({ embed });
    }

};
