const { Command } = require('../../index');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['socialmanage'],
            guildOnly: true,
            permLevel: 2,
            mode: 2,
            spam: true,
            cooldown: 10,

            usage: '<delete|add|remove> <user:advuser> [value:int]',
            usageDelim: ' ',
            description: 'Manage the local leaderboards.',
            extendedHelp: Command.strip`
                Oi! This guy should have more points!

                ⚙ | ***Explained usage***
                Skyra, social [action] [user] [value]
                Action :: Either 'delete', 'add' or 'remove'.
                User   :: The targetted user profile to modify.
                Value  :: The amount to add or remove (depending on action, not required for action:delete).

                = Actions =
                Delete :: Remove an entry from the leaderboards.
                Add    :: Add points to a user profile.
                Remove :: Remove points from a user profile.

                = Reminder =
                    • You edit local points, you cannot modify properties like amount of money or anything else that is global.
            `
        });
    }

    async run(msg, [action, user = msg.author, value], settings, i18n) {
        const profile = await this.searchProfile(msg, user, i18n);
        if (!profile) throw i18n.get('COMMAND_SOCIAL_PROFILE_NOTFOUND');
        if (action === 'delete') {
            await this.client.handler.social.local.get(msg.guild.id).removeMember(user.id);
            return msg.send(i18n.get('COMMAND_SOCIAL_PROFILE_DELETE', user.tag, profile.score));
        }
        if (typeof value === 'undefined')
            throw i18n.get('COMMAND_SOCIAL_POINTS');

        const old = profile.score;
        const amount = action === 'add' ? old + value : Math.max(old - value, 0);
        await profile.update(amount);

        return msg.send(i18n.get('COMMAND_SOCIAL_UPDATE', action, value, user.tag, old, amount));
    }

    async searchProfile(msg, user, i18n) {
        if (user.bot) throw i18n.get('COMMAND_SOCIAL_PROFILE_BOT');
        return this.client.handler.social.local.getMember(msg.guild.id, user.id) || null;
    }

};
