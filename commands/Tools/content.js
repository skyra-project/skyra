const { Command } = require('../../index');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            guildOnly: true,
            mode: 2,
            cooldown: 15,

            usage: '<message:string{17,19}> [channel:channel]',
            usageDelim: ' ',
            description: "Get messages' raw content."
        });
    }

    async run(msg, [searchMessage, channel = msg.channel], settings, i18n) {
        if (/[0-9]{17,21}/.test(searchMessage) === false)
            throw i18n.get('RESOLVER_INVALID_MSG', 'Message');

        const mes = await channel.fetchMessage(searchMessage)
            .catch(() => { throw i18n.get('SYSTEM_MESSAGE_NOT_FOUND'); });

        const attachments = mes.attachments.size > 0
            ? `\n\n\n=============\n${mes.attachments.map(att => `📁 <${att.url}>`).join('\n')}`
            : '';

        return msg.send(mes.content + attachments, { code: 'md' });
    }

};
