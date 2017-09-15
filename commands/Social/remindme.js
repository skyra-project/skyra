const { Command, Timer } = require('../../index');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['remind', 'reminder'],
            mode: 2,
            cooldown: 30,

            usage: '<input:string>',
            description: 'Add reminders.',
            extendedHelp: Command.strip`
                Ooh, reminders.

                ⚙ | ***Explained usage***
                Skyra, remindme <text> in <time>

                = Arguments =
                text :: The text you want me to remind you.
                time :: When do you want me to remind you

                = Examples =
                Skyra, remindme To get dailies in 12h
                ❯❯ I'll set a reminder with text 'To get dailies' and the reminder will be sent in '12h'.

                = Advice =
                The number and the unit must be written together at the moment, and if you do not specify the unit, it'll take milliseconds by default.
            `
        });
    }

    async run(msg, [raw], settings, i18n) {
        const input = /^(.+)\sin\s(.+)$/.exec(raw);
        if (input === null)
            throw i18n.get('COMMAND_REMINDME_INPUT');

        const addtime = new Timer(input[2]).Duration;

        if (addtime < 60000)
            throw i18n.get('COMMAND_REMINDME_TIME');

        const id = await this.client.handler.clock.create({
            type: 'reminder',
            timestamp: addtime + Date.now(),
            user: msg.author.id,
            content: input[1]
        }).catch((err) => { throw err; });

        return msg.send(i18n.get('COMMAND_REMINDME_CREATE', id));
    }

};
