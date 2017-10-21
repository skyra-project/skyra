const { Command, ModLog, Timer } = require('../../../index');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            guildOnly: true,
            permLevel: 2,
            mode: 2,

            cooldown: 5,

            usage: '[cancel] <Case:integer> [timer:string] [...]',
            usageDelim: ' ',
            description: 'Sets a timer.'
        });
    }

    async run(msg, [cancel, selected, ...time], settings, i18n) {
        const cases = await settings.moderation.getCases();
        const doc = cases[selected];
        if (!doc) throw i18n.get('COMMAND_REASON_NOT_EXISTS');
        if (doc.timed === true) throw i18n.get('COMMAND_TIME_TIMED');

        const user = await this.client.users.fetch(doc.user);

        const type = await this.getActions(msg, doc, user).catch(error => { throw i18n.get(error); });

        const exists = this.client.handler.clock.tasks.find(task => task.type === type && task.user === doc.user);
        if (cancel) return this.cancel(msg, selected, settings, exists, i18n);
        if (exists) {
            if (doc.appeal === true) throw i18n.get('MODLOG_APPEALED');
            throw i18n.get('MODLOG_TIMED', exists.timestamp - Date.now());
        }
        if (time.length === 0) throw i18n.get('COMMAND_TIME_UNDEFINED_TIME');

        const length = new Timer(time.join(' ')).Duration;

        await this.client.handler.clock.create({
            type,
            timestamp: length + Date.now(),
            user: doc.user,
            guild: msg.guild.id,
            duration: length
        }).catch(Command.handleError);

        await settings.moderation.updateCase(selected, { timed: true });

        return msg.send(i18n.get('COMMAND_TIME_SCHEDULED', ModLog.getColor(type).title, user, length));
    }

    async cancel(msg, selected, settings, task, i18n) {
        if (!task) throw i18n.get('COMMAND_TIME_NOT_SCHEDULED');
        await this.client.handler.clock.remove(task.id);
        await settings.moderation.updateCase(selected, { timed: false });
        return msg.send(i18n.get('COMMAND_TIME_ABORTED', ModLog.getColor(task.type).title));
    }

    getActions(msg, doc, user) {
        switch (doc.type) {
            case 'ban': return this.checkBan(msg, doc, user);
            case 'mute': return this.checkMute(msg, doc);
            case 'vmute': return this.checkVMute(msg, doc, user);
            default: throw 'COMMAND_TIME_UNSUPPORTED_TIPE';
        }
    }

    async checkBan(msg, doc, user) {
        if (msg.guild.me.permissions.has('BAN_MEMBERS') !== true) throw 'COMMAND_UNBAN_MISSING_PERMISSION';

        const users = await msg.guild.fetchBans().catch(() => { throw 'SYSTEM_FETCHBANS_FAIL'; });
        if (users.size === 0) throw 'GUILD_BANS_EMPTY';

        const member = users.get(user.id) || null;
        if (member === null) throw 'GUILD_BANS_NOT_FOUND';

        return 'unban';
    }

    async checkMute(msg, doc) {
        if (msg.guild.settings.moderation.mutes.has(doc.user) !== true) throw 'COMMAND_MUTE_USER_NOT_MUTED';
        if (msg.guild.me.permissions.has('MANAGE_ROLES') !== true) throw 'COMMAND_UNMUTE_MISSING_PERMISSION';
        return 'unmute';
    }

    async checkVMute(msg, doc, user) {
        if (msg.guild.me.permissions.has('MUTE_MEMBERS') !== true) throw 'COMMAND_VMUTE_MISSING_PERMISSION';
        const member = await msg.guild.members.fetch(user).catch(() => { throw 'USER_NOT_IN_GUILD'; });

        if (member.serverMute !== true) throw 'COMMAND_VMUTE_USER_NOT_MUTED';

        return 'vunmute';
    }

};
