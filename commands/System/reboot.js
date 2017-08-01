const { Command } = require('../../index');

/* eslint-disable class-methods-use-this */
module.exports = class Reboot extends Command {

    constructor(...args) {
        super(...args, 'reboot', {
            aliases: ['restart'],
            permLevel: 10,
            mode: 2,

            description: 'Reboot the bot.'
        });
    }

    async run(msg) {
        await msg.send('Rebooting...').catch(() => null);
        process.exit();
    }

};
