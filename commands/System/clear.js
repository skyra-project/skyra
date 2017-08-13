const { Command } = require('../../index');

/* eslint-disable class-methods-use-this */
module.exports = class extends Command {

    constructor(...args) {
        super(...args, 'clear', {
            guildOnly: true,
            permLevel: 10,
            mode: 2,

            usage: '<limit:int>',
            description: 'Clear some messages from me.'
        });
    }

    async run(msg, [limit]) {
        const messages = await msg.channel.fetchMessages({ limit }).then(msgs => msgs.filter(mes => mes.author.id === this.clientID));
        for (const message of messages.values()) await message.delete().catch(err => this.client.emit('log', err, 'error'));
    }

    get clientID() {
        return this.client.user.id;
    }

};
