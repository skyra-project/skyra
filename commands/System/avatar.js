const { Command } = require('../../index');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            permLevel: 10,
            mode: 2,

            usage: '[attachment:attachment]',
            description: "Set's the bot's avatar."
        });
    }

    async run(msg, [avatar]) {
        await this.client.user.setAvatar(avatar)
            .catch(Command.handleError);

        return msg.send(`Dear ${msg.author}, I have changed my avatar for you.`);
    }

};
