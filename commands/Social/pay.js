const { Command } = require('../../index');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            guildOnly: true,
            mode: 1,
            spam: true,
            cooldown: 10,

            usage: '<amount:int> <user:user>',
            usageDelim: ' ',
            description: 'Pay somebody with your shinies.',
            extendedHelp: Command.strip`
                Businessmen! Today is payday!

                = Usage =
                Skyra, pay [money] [user]
                Money :: Amount of shinies to pay, you must have the amount you are going to pay.
                User  :: The targetted user to pay. (Must be mention/id)

                = Example =
                • Skyra, pay 200 @kyra
                    I will get 200 shinies from your bank and give them to the user.
            `
        });
    }

    async run(msg, [money, user]) {
        if (msg.author.id === user.id) throw msg.language.get('COMMAND_PAY_SELF');
        else if (money <= 0) throw msg.language.get('RESOLVER_POSITIVE_AMOUNT');
        else if (msg.author.profile.money < money) throw msg.language.get('COMMAND_SOCIAL_MISSING_MONEY', money, msg.author.profile.money, Command.shiny(msg));
        else if (user.bot) return msg.send(msg.language.get('COMMAND_SOCIAL_PAY_BOT'));

        return msg.prompt(msg.language.get('COMMAND_PAY_PROMPT', user.username, money, Command.shiny(msg)))
            .then(() => this.acceptPayment(msg, user, money))
            .catch(() => this.denyPayment(msg));
    }

    async acceptPayment(msg, user, money) {
        await user.profile.add(money).catch(Command.handleError);
        await msg.author.profile.use(money).catch(Command.handleError);
        return msg.alert(msg.language.get('COMMAND_PAY_PROMPT_ACCEPT', user.username, money, Command.shiny(msg)));
    }

    async denyPayment(msg) {
        return msg.alert(msg.language.get('COMMAND_PAY_PROMPT_DENY'));
    }

};
