const { Command } = require('../../index');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['reps'],
            mode: 1,
            spam: true,
            cooldown: 10,

            description: 'Check your amount of reputation points.'
        });
    }

    async run(msg, params, settings, i18n) {
        return msg.send(i18n.get('COMMAND_REPUTATIONS', msg.author.profile.reputation));
    }

};
