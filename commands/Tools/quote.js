const { Command, Discord: { Embed } } = require('../../index');

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
        const m = await channel.fetchMessage(searchMessage).catch(Command.handleError);

        const attachment = m.attachments.size ? m.attachments.find(att => /jpg|png|webp|gif/.test(att.url.split('.').pop())) : null;
        if (!attachment && !m.content) throw "it is weird, but this message doesn't have a content nor image.";

        const embed = new Embed()
            .setAuthor(m.author.tag, m.author.displayAvatarURL({ size: 128 }))
            .setDescription(m.content)
            .setImage(attachment ? attachment.url : null)
            .setTimestamp(m.createdAt);
        return msg.send({ embed });
    }

};
