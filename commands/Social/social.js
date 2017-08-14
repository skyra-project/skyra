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

                = Usage =
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

    async run(msg, [action, user = msg.author, value = null]) {
        const profile = await this.searchProfile(msg, user);
        if (!profile) throw 'profile not found.';
        if (action === 'delete') {
            await this.client.handler.social.local.get(msg.guild.id).removeMember(user.id);
            return msg.alert(`Successfully deleted the profile ${user.tag}, with ${profile.points}`);
        }
        if (!value) throw 'you must specify an amount of money.';
        let amount;
        if (action === 'add') amount = profile.points + value;
        else amount = Math.max(profile.points - value, 0);

        await profile.update(amount);
        return msg.alert(`Dear ${msg.author}, you have just ${action === 'add' ? 'add' : 'remov'}ed ${amount} points from user ${user.tag}. Before: ${profile.points}; Now: ${amount}`);
    }

    async searchProfile(msg, user) {
        if (user.bot) throw "you can't modify bot profiles, since they don't have one.";
        return this.client.handler.social.local.getMember(msg.guild.id, user.id) || null;
    }

};
