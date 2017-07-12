const { Command } = require("../../index");

/* eslint-disable class-methods-use-this */
module.exports = class Reputations extends Command {

    constructor(...args) {
        super(...args, "reputations", {
            aliases: ["reps"],
            mode: 1,
            spam: true,

            description: "Check your amount of reputation points.",
        });
    }

    async run(msg) {
        const rep = msg.author.profile.reputation;
        return msg.send(`Dear ${msg.author}, you have a total of ${rep} reputation point${rep !== 1 ? "s" : ""}`);
    }

};
