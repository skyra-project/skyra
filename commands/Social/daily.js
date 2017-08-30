const { Command } = require('../../index');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['dailies'],
            mode: 1,
            spam: true,
            cooldown: 30,

            description: 'Get your daily shinies.',
            extendedHelp: Command.strip`
                Shiiiiiny!

                = Usage =
                Skyra, daily

                = Reminder =
                    • Skyra uses a virtual currency called Shiny, and it's used to buy stuff such as banners or bet it on slotmachines.
                    • You can claim dailies once every 12 hours.
            `
        });
    }

    async run(msg) {
        const now = Date.now();
        const profile = msg.author.profile;
        const time = profile.timeDaily;

        if (time > now) {
            const remaining = time - now;
            if (remaining > 3600000) return msg.send(msg.language.get('COMMAND_DAILY_TIME', remaining));
            return msg.prompt(msg.language.get('COMMAND_DAILY_GRACE', remaining))
                .then(async () => {
                    const next = now + 43200000 + remaining;
                    const money = await profile.win(200, msg.guild);
                    await profile.update({ timeDaily: next });
                    return msg.send(msg.language.get('COMMAND_DAILY_GRACE_ACCEPTED', money, Command.shiny(msg), 43200000 + remaining));
                })
                .catch(() => msg.send(msg.language.get('COMMAND_DAILY_GRACE_DENIED')));
        }
        const next = now + 43200000;
        const money = await profile.win(200, msg.guild);
        await profile.update({ timeDaily: next });
        return msg.send(msg.language.get('COMMAND_DAILY_TIME_SUCCESS', money, Command.shiny(msg)));
    }

};
