const { Inhibitor, util } = require('../index');
const { Permissions } = require('discord.js');

module.exports = class extends Inhibitor {

    constructor(...args) {
        super(...args);
        this.impliedPermissions = new Permissions([
            'VIEW_CHANNEL',
            'SEND_MESSAGES',
            'SEND_TTS_MESSAGES',
            'EMBED_LINKS',
            'ATTACH_FILES',
            'READ_MESSAGE_HISTORY',
            'MENTION_EVERYONE',
            'USE_EXTERNAL_EMOJIS',
            'ADD_REACTIONS'
        ]);
    }

    async run(msg, cmd, settings, i18n) {
        const missing = msg.channel.type === 'text' ? msg.channel.permissionsFor(msg.guild.me).missing(cmd.botPerms) : this.impliedPermissions.missing(cmd.botPerms);
        if (missing.length > 0) throw i18n.get('INHIBITOR_MISSING_BOT_PERMS', util.toTitleCase(missing.join(', ').split('_').join(' ')));
        return;
    }

};
