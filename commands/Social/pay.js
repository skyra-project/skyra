const { Command } = require("../../index");

/* eslint-disable class-methods-use-this */
module.exports = class Pay extends Command {

    constructor(...args) {
        super(...args, "pay", {
            guildOnly: true,
            mode: 1,
            spam: true,

            usage: "<amount:int> <user:user>",
            usageDelim: " ",
            description: "Pay somebody with your shinies.",
            extendedHelp: Command.strip`
                Businessmen! Today is payday!

                = Usage =
                Skyra, pay [money] [user]
                Money :: Amount of shinies to pay, you must have the amount you are going to pay.
                User  :: The targetted user to pay. (Must be mention/id)

                = Example =
                • Skyra, pay 200 @kyra
                    I will get 200 shinies from your bank and give them to the user.
            `,
        });
    }

    async run(msg, [money, user]) {
        if (msg.author.id === user.id) throw "you can't pay yourself.";
        else if (money <= 0) throw "amount of money should be above 0.";
        else if (msg.author.profile.money < money) throw `you can't pay with money you don't have. Current currency: ${msg.author.profile.money}${Command.shiny(msg)}`;

        return msg.prompt(`Dear ${msg.author}, you're going to pay ${money}${Command.shiny(msg)} to ${user.username}, do you accept?`)
            .then(() => this.acceptPayment(msg, user, money))
            .catch(() => this.denyPayment(msg));
    }

    async acceptPayment(msg, user, money) {
        await user.profile.add(money).catch(Command.handleError);
        await msg.author.profile.use(money).catch(Command.handleError);
        return msg.alert(`Dear ${msg.author}, you have just paid ${money}${Command.shiny(msg)} to **${user.username}**`);
    }

    async denyPayment(msg) {
        return msg.alert(`Dear ${msg.author}, you have just cancelled the transfer.`);
    }

};
