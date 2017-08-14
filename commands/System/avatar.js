const { Command } = require('../../index');

/* eslint-disable class-methods-use-this */
module.exports = class Avatar extends Command {

    constructor(...args) {
        super(...args, {
            permLevel: 10,
            mode: 2,

            usage: '[url:url]',
            description: "Set's the bot's avatar."
        });
    }

    async run(msg, [avatar]) {
        if (!avatar) {
            if (!msg.attachments.first()) throw 'you have to specify an URL or upload an image';
            avatar = msg.attachments.first().url;
        }

        await this.client.user.setAvatar(avatar).catch(Command.handleError);
        return msg.alert(`Dear ${msg.author}, I have changed my avatar for you.`);
    }

};
