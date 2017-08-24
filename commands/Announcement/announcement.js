const { Command } = require('../../index');
const announcement = require('../../utils/announcement');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            guildOnly: true,
            permLevel: 2,

            description: 'Send new announcements, mentioning the announcement role.',
            usage: '<string:string>',
            cooldown: 60
        });
    }

    async run(msg, [message], settings) {
        const i18n = msg.language;

        const announcementID = settings.channels.announcement;
        if (!announcementID) throw i18n.get('COMMAND_SUBSCRIBE_NO_CHANNEL');

        const channel = msg.guild.channels.get(announcementID);
        if (!channel) throw i18n.get('COMMAND_SUBSCRIBE_NO_CHANNEL');

        if (channel.postable === false) throw i18n.get('SYSTEM_CHANNEL_NOT_POSTABLE');

        const role = announcement(msg);
        await role.edit({ mentionable: true });
        await channel.send(`${i18n.get('COMMAND_ANNOUNCEMENT', role)}\n${message}`);
        await role.edit({ mentionable: false });
        return msg.send(i18n.get('COMMAND_SUCCESS'));
    }

};
