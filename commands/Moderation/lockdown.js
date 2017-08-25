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

    async run(msg, [channel = msg.channel, ...time]) {
        return this[channel.lockdown ? 'unlock' : 'lock'](msg, channel, time.length > 0 ? time.join(' ') : null);
    }

    async unlock(msg, channel) {
        const role = msg.guild.roles.find('name', '@everyone');
        await channel.overwritePermissions(role, { SEND_MESSAGES: true });
        delete channel.lockdown;
        return msg.send(msg.language.get('COMMAND_LOCKDOWN_OPEN', channel));
    }

    async lock(msg, channel, time) {
        const role = msg.guild.roles.find('name', '@everyone');
        const message = await msg.send(msg.language.get('COMMAND_LOCKDOWN_LOCKING', channel));
        await channel.overwritePermissions(role, { SEND_MESSAGES: false });
        if (msg.channel.postable) await msg.send(msg.language.get('COMMAND_LOCKDOWN_LOCK', channel));
        channel.lockdown = time ? setTimeout(() => this.unlock(message, channel), new Timer(time).Duration) : true;
    }

};
