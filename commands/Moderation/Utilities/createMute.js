const { Command } = require('../../../index');
const { createMuted } = require('../../../utils/assets');

/* eslint-disable class-methods-use-this */
module.exports = class extends Command {

    constructor(...args) {
        super(...args, 'createmute', {
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
