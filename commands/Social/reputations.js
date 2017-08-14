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

    async run(msg) {
        const rep = msg.author.profile.reputation;
        return msg.send(`Dear ${msg.author}, you have a total of ${rep} reputation point${rep !== 1 ? 's' : ''}`);
    }

};
