const { Command, Managers: { SocialLocal } } = require('../../index');
const Rethink = require('../../providers/rethink');

/* eslint-disable class-methods-use-this */
module.exports = class Social extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['socialmanage'],
            guildOnly: true,
            permLevel: 2,
            mode: 2,
            spam: true,

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

    async run(msg, [action, search = msg.author.id, value = null]) {
        const ID = await this.searchProfile(msg, search);
        if (action === 'delete') {
            throw 'this action is not available yet.';
            // await this.nuke(client, ID);
            // await msg.alert(`Dear ${msg.author}, you have just nuked the profile from user ID ${ID}`);
        } else {
            if (!value) throw 'you must specify an amount of money.';
            const newValue = this.handle(msg, action, ID, value);
            await this.update(msg, ID, value);
            return msg.alert(`Dear ${msg.author}, you have just ${action === 'add' ? 'added' : 'removed'} ${newValue} points from user ID: ${ID}`);
        }
    }

    async searchProfile(msg, search) {
        if (/[0-9]{17,21}/.test(search) && SocialLocal.get(msg.guild.id).has(search)) {
            return search;
        }
        const user = await this.client.handler.search.user(search, msg);
        if (user.bot) throw "you can't modify bot profiles, since they don't have one.";
        if (!SocialLocal.get(msg.guild.id).has(search)) {
            const data = { id: user.id, score: 0 };
            await Rethink.append('localScores', msg.guild.id, 'scores', data);
            SocialLocal.insert(msg.guild.id, user.id, data);
        }
        return user.id;
    }

    async update(msg, id, value) {
        await Rethink.updateArrayByID('localScores', msg.guild.id, 'scores', id, { score: value });
        SocialLocal.get(msg.guild.id).get(id).score = value;
    }

    async handle(msg, action, ID, value) {
        const profile = SocialLocal.get(msg.guild.id).get(ID);
        if (action === 'add') return profile.score + value;
        return Math.max(profile.score - value, 0);
    }

};
