const { Command } = require('../../../index');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            guildOnly: true,
            permLevel: 1,
            mode: 2,
            cooldown: 15,

            usage: '[channel:channel]',
            description: 'Check the messages/minute from a channel.'
        });
    }

    async run(msg, [input], settings, i18n) {
        const channel = typeof input !== 'undefined' ? await this.client.handler.search.channel(input, msg) : msg.channel;

        if (!channel.readable) throw i18n.get('CHANNEL_NOT_READABLE');
        const messages = await channel.messages.fetch({ limit: 100 });
        const amount = messages.filter(mes => mes.createdTimestamp > msg.createdTimestamp - 60000).size;
        return msg.send(i18n.get('COMMAND_FLOW', amount));
    }

};
