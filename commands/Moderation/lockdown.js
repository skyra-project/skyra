const { Command, Timer } = require('../../index');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['lock'],
            guildOnly: true,
            permLevel: 2,
            botPerms: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
            mode: 2,
            cooldown: 10,

            usage: '[channel:channel] [time:string]',
            usageDelim: ' ',
            description: 'Lock/unlock the selected channel.'
        });
    }

    async run(msg, [channel = msg.channel, ...time], settings, i18n) {
        return this[channel.lockdown ? 'unlock' : 'lock'](msg, channel, time.length > 0 ? time.join(' ') : null, i18n);
    }

    async unlock(msg, channel, time, i18n) {
        const role = msg.guild.roles.find('name', '@everyone');
        await channel.overwritePermissions(role, { SEND_MESSAGES: true });
        delete channel.lockdown;
        return msg.send(i18n.get('COMMAND_LOCKDOWN_OPEN', channel));
    }

    async lock(msg, channel, time, i18n) {
        const role = msg.guild.roles.find('name', '@everyone');
        const message = await msg.send(i18n.get('COMMAND_LOCKDOWN_LOCKING', channel));
        await channel.overwritePermissions(role, { SEND_MESSAGES: false });
        if (msg.channel.postable) await msg.send(i18n.get('COMMAND_LOCKDOWN_LOCK', channel));
        channel.lockdown = time ? setTimeout(() => this.unlock(message, channel), new Timer(time).Duration) : true;
    }

};
