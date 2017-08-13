const { Command } = require('../../index');
const { RichEmbed } = require('discord.js');

/* eslint-disable class-methods-use-this */
module.exports = class Quote extends Command {

    constructor(...args) {
        super(...args, 'quote', {
            botPerms: ['EMBED_LINKS'],
            mode: 2,

            usage: '<message:string{17,21}> [channel:channel]',
            usageDelim: ' ',
            description: "Quote another people's message."
        });
    }

    async run(msg, [searchMessage, channel = msg.channel]) {
        if (!/[0-9]{17,21}/.test(searchMessage)) throw 'I was expecting a Message Snowflake (Message ID).';
        const mes = await channel.fetchMessage(searchMessage).catch(Command.handleError);

        const attachment = mes.attachments.size ? mes.attachments.find(att => /jpg|png|webp|gif/.test(att.url.split('.').pop())) : null;
        if (!attachment && !mes.content) throw "it is weird, but this message doesn't have a content nor image.";

        const embed = new RichEmbed()
            .setAuthor(mes.author.tag, mes.author.displayAvatarURL({ size: 128 }))
            .setDescription(mes.content)
            .setImage(attachment ? attachment.url : null)
            .setTimestamp(mes.createdAt);
        return msg.send({ embed });
    }

};
