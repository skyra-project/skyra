const { Command } = require("../../index");
const moment = require("moment");
require("moment-duration-format");

/* eslint-disable class-methods-use-this */
module.exports = class Daily extends Command {

    constructor(...args) {
        super(...args, "daily", {
            mode: 1,
            spam: true,

            description: "Get your daily shinies.",
            extendedHelp: Command.strip`
                Shiiiiiny!

                = Usage =
                Skyra, daily

                = Reminder =
                    • Skyra uses a virtual currency called Shiny, and it's used to buy stuff such as banners or bet it on slotmachines.
                    • You can claim dailies once every 12 hours.
            `,
        });
    }

    async run(msg) {
        const now = new Date().getTime();

        if (msg.author.profile.timeDaily + 43200000 > now) {
            const remaining = (msg.author.profile.timeDaily + 43200000) - now;
            return msg.send(`Dailies are available in ${moment.duration(remaining).format("hh [**hours**,] mm [**mins**,] ss [**secs**]")}.`);
        }
        const money = await msg.author.profile.win(200, msg.guild);
        await msg.author.profile.update({ timeDaily: now });
        return msg.send(`You have just earned ${money}${Command.shiny(msg)}! Next dailies are available in 12 hours.`);
    }

};
