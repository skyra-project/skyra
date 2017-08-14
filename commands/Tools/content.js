const { Command } = require('../../index');

/* eslint-disable class-methods-use-this */
module.exports = class Content extends Command {

    constructor(...args) {
        super(...args, {
            guildOnly: true,
            mode: 2,

            usage: '<message:string{17,21}> [channel:channel]',
            usageDelim: ' ',
            description: "Get messages' raw content."
        });
    }

    async run(msg, [searchMessage, channel = msg.channel]) {
        if (!/[0-9]{17,21}/.test(searchMessage)) throw 'I was expecting a Message Snowflake (Message ID).';
        const mes = await channel.fetchMessage(searchMessage).catch(Command.handleError);
        const attachments = mes.attachments.size > 0 ? mes.attachments.map(att => `<${att.url}>`) : null;

        return msg.send(mes.content + (attachments ? `\n\n\n=============\n<Attachments>\n${attachments.join('\n')}` : ''), { code: 'md' });
    }

};
