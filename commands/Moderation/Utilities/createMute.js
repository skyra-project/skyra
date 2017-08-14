const { Command } = require('../../../index');
const { createMuted } = require('../../../utils/assets');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            guildOnly: true,
            permLevel: 4,
            botPerms: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
            mode: 2,
            cooldown: 150,

            description: 'Prepare the mute system.'
        });
    }

    async run(msg) {
        await msg.send('`Processing...`');
        return createMuted(msg);
    }

};
