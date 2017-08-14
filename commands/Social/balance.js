const { Command } = require('../../index');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['bal', 'credits'],
            mode: 1,
            spam: true,
            cooldown: 30,

            description: 'Check your current balance.'
        });
    }

    async run(msg) {
        return msg.send(`Dear ${msg.author}, you have a total of ${msg.author.profile.money}${Command.shiny(msg)}`);
    }

};
