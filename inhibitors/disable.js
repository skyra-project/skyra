const { Inhibitor } = require('../index');

module.exports = class extends Inhibitor {

    async run(msg, cmd, settings, i18n) {
        if (cmd.enabled || msg.channel.type !== 'text' || !settings.disable.commands.includes(cmd.name)) return;
        throw i18n.get('INHIBITOR_DISABLED');
    }

};
