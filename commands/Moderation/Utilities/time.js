const { Command } = require('../../../index');
const ModLog = require('../../../utils/createModlog.js');
const Timer = require('../../../utils/timer');

const moment = require('moment');
const duration = time => moment.duration(time).format('hh [hours,] mm [minutes,] ss [seconds]');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            guildOnly: true,
            permLevel: 2,
            botPerms: [],
            mode: 2,

            cooldown: 5,

            usage: '<Case:integer> <timer:string> [...]',
            usageDelim: ' ',
            description: 'Sets a timer.'
        });
    }

    async run(msg, [selected, ...time], settings) {
        const cases = await settings.moderation.getCases();
        const doc = cases[selected];
        if (!doc) throw 'this case does not seem to exist.';

        const user = await this.client.fetchUser(doc.user);

        const type = await this.getActions(msg, doc, user);

        const exists = this.client.clock.tasks.find(task => task.type === type && task.user === doc.user);
        if (exists) throw `This action is already scheduled and ending in ${duration(exists.timestamp - Date.now())}`;

        const length = new Timer(time.join(' ')).Duration;

        await this.client.clock.create({
            type,
            timestamp: length + Date.now(),
            user: doc.user,
            guild: msg.guild.id,
            duration
        }).catch(Command.handleError);

        await settings.moderation.updateCase(selected, { timed: true });

        return msg.send(`✅ Successfully scheduled a moderation action type **${ModLog.getColor(type).title}** for the user ${user.tag} (${user.id}) with a duration of ${duration(length)}`);
    }

    getActions(msg, doc, user) {
        switch (doc.type) {
            case 'ban': return this.checkBan(msg, doc, user);
            case 'mute': return this.checkMute(msg, doc);
            case 'vmute': return this.checkVMute(msg, doc, user);
            default: throw 'The type of action for the selected case cannot be reverse, therefore this action is unsupported.';
        }
    }

    async checkBan(msg, doc, user) {
        if (msg.guild.me.permissions.has('BAN_MEMBERS') !== true) throw 'I will need the BAN MEMBERS permissions to be able to unban.';

        const users = await msg.guild.fetchBans();
        if (users.size === 0) throw msg.guild.language('GUILD_BANS_EMPTY');

        const member = users.get(user.id) || null;
        if (member === null) throw msg.guild.language('GUILD_BANS_NOT_FOUND');

        return 'unban';
    }

    async checkMute(msg, doc) {
        if (msg.guild.settings.moderation.mutes.has(doc.user) !== true) throw 'This user is not muted.';
        if (msg.guild.me.permissions.has('MANAGE_ROLES') !== true) throw 'I will need the MANAGE ROLES permissions to be able to unmute.';
        return 'unmute';
    }

    async checkVMute(msg, doc, user) {
        if (msg.guild.me.permissions.has('MUTE_MEMBERS') !== true) throw 'I will need the MUTE MEMBERS permissions to be able to unmute.';

        const member = await msg.guild.fetchMember(user).catch(() => { throw msg.language.get('USER_NOT_IN_GUILD'); });

        if (member.serverMute !== true) throw 'This user is not voice muted.';

        return 'vunmute';
    }

};
