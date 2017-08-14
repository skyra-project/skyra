const { Command } = require('../../index');

/* eslint-disable class-methods-use-this */
module.exports = class Invite extends Command {

    constructor(...args) {
        super(...args, {
            mode: 2,

            description: 'Displays the join server link of the bot.'
        });
    }

    async run(msg) {
        return msg.send(msg.language.get('COMMAND_INVITE', this.client));
    }

};
