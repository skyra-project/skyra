const Command = require("../../classes/command");

/* eslint-disable class-methods-use-this */
module.exports = class Balance extends Command {

    constructor(...args) {
        super(...args, "balance", {
            aliases: ["bal", "credits"],
            mode: 1,
            spam: true,

            description: "Check your current balance.",
        });
    }

    async run(msg) {
        return msg.send(`Dear ${msg.author}, you have a total of ${msg.author.profile.money}${Command.shiny(msg)}`);
    }

};
