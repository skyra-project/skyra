const Command = require("../../classes/command");

const { timer } = require("../../functions/wrappers");

/* eslint-disable class-methods-use-this */
module.exports = class Reminder extends Command {

    constructor(...args) {
        super(...args, "remindme", {
            aliases: ["remind", "reminder"],
            mode: 2,

            usage: "<input:string>",
            description: "Add reminders.",
            extendedHelp: Command.strip`
                Ooh, reminders.

                = Usage =
                Skyra, remindme <text> in <time>

                = Arguments =
                text :: The text you want me to remind you.
                time :: When do you want me to remind you

                = Examples =
                Skyra, remindme To get dailies in 12h
                ❯❯ I'll set a reminder with text 'To get dailies' and the reminder will be sent in '12h'.

                = Advice =
                The number and the unit must be written together at the moment, and if you do not specify the unit, it'll take milliseconds by default.
            `,
        });
    }

    async run(msg, [raw]) {
        const input = /^(.+)\sin\s(.+)$/.exec(raw);
        if (!input) throw "You must tell me what do you want me to remind you and when.";

        const addtime = timer(input[2].split(" "));
        if (addtime < 60000) throw "Your reminder must be at least one minute long";
        const snowflake = await this.client.clock.create({
            type: "reminder",
            timestamp: addtime + new Date().getTime(),
            user: msg.author.id,
            content: input[1],
        }).catch((err) => { throw err; });

        return msg.send(`Dear ${msg.author}, a reminder with ID \`${snowflake}\` has been created.`);
    }

};
