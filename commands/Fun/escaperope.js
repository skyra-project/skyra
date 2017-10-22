const { Command } = require('../../index');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            cooldown: 60,

            description: 'Use the escape rope from Pokemon.',
            extend: { EXPLANATION: '**Skyra** used **Escape Rope**' }
        });
    }

    async run(msg, args, settings, i18n) {
        if (msg.deletable)
            msg.nuke().catch(() => null);

        return msg.send(i18n.get('COMMAND_ESCAPEROPE', msg.author));
    }

};
