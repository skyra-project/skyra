const { Command } = require('../../index');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['rep'],
            guildOnly: true,
            mode: 1,
            spam: true,
            cooldown: 30,

            usage: '[user:string]',
            description: 'Give somebody a reputation point.',
            extendedHelp: Command.strip`
                This guy is so helpful... I'll give him a reputation point!

                ⚙ | ***Explained usage***
                Skyra, rep [user]
                User :: The user to give a reputation point.

                = Reminder =
                    • You can give a reputation point once every 24 hours.
            `
        });
    }

    async run(msg, [input], settings, i18n) {
        const now = Date.now();
        const profile = msg.author.profile;

        if (profile.timerep + 86400000 > now) {
            const remaining = (profile.timerep + 86400000) - now;
            return msg.send(i18n.get('COMMAND_REPUTATION_TIME', remaining));
        }

        if (typeof input === 'undefined')
            return msg.send(i18n.get('COMMAND_REPUTATION_USABLE'));


        return this.giveReputation(msg, profile, input, now, i18n);
    }

    async giveReputation(msg, profile, input, now, i18n) {
        const user = await this.client.handler.search.user(input, msg);

        if (!user)
            throw i18n.get('COMMAND_REPUTATION_USER_NOTFOUND');
        if (msg.author.id === user.id)
            throw i18n.get('COMMAND_REPUTATION_SELF');
        if (user.bot)
            throw i18n.get('COMMAND_REPUTATION_BOTS');

        let targetProfile = user.profile;
        if (targetProfile instanceof Promise)
            targetProfile = await targetProfile;

        await targetProfile.update({ reputation: targetProfile.reputation + 1 });
        await profile.update({ timerep: now });
        return msg.send(i18n.get('COMMAND_REPUTATION_GIVE', user.username));
    }

};
