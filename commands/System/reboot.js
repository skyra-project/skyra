const { Command } = require('../../index');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
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
