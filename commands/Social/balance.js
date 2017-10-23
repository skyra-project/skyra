const { Command } = require('../../index');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['bal', 'credits'],
            mode: 1,
            spam: true,
            cooldown: 10,

            usage: '[user:string]',
            description: 'Check your current balance.'
        });
    }

    async run(msg, [input = null], settings, i18n) {
        if (input !== null) {
            const user = await this.client.handler.search.user(input, msg);

            if (user !== null && msg.author.id !== user.id) {
                const targetProfile = await user.profile;
                return msg.send(i18n.get('COMMAND_BALANCE', user.username, targetProfile.money, Command.shiny(msg)));
            }
        }
        return msg.send(i18n.get('COMMAND_BALANCE_SELF', msg.author.profile.money, Command.shiny(msg)));
    }

};
