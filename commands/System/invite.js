const { Command } = require('../../index');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            mode: 2,
            cooldown: 5,

            description: 'Displays the join server link of the bot.'
        });
    }

    async run(msg) {
        return msg.send(msg.language.get('COMMAND_INVITE', this.client));
    }

};
