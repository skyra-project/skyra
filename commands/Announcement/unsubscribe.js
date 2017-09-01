const { Command, announcement } = require('../../index');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            guildOnly: true,

            description: 'Unsubscribe to this servers\' announcements.',
            cooldown: 15
        });
    }

    async run(msg, args, settings, i18n) {
        const role = announcement(msg);
        await msg.member.removeRole(role);
        return msg.send(i18n.get('COMMAND_UNSUBSCRIBE_SUCCESS', role.name));
    }

};
