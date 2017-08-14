const { Inhibitor } = require('../index');

module.exports = class extends Inhibitor {

    async run(msg, cmd, settings) {
        if (cmd.enabled || msg.channel.type !== 'text' || !settings.disable.commands.includes(cmd.name)) return;
        throw msg.language.get('INHIBITOR_DISABLED');
    }

};
