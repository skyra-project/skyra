const { Command } = require('../../index');

/* eslint-disable class-methods-use-this */
module.exports = class Invite extends Command {

    constructor(...args) {
        super(...args, 'invite', {
            mode: 2,

            description: 'Displays the join server link of the bot.'
        });

        this.invite = Command.strip`
            To add Skyra to your discord guild: <${this.client.invite}>
            Don't be afraid to uncheck some permissions, Skyra will let you know if you're trying to run a command without permissions.
        `;
    }

    async run(msg) {
        return msg.send(this.invite);
    }

};
