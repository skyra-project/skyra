const { structures: { Inhibitor } } = require('../index');

module.exports = class extends Inhibitor {

	async run(msg, cmd, settings, i18n) {
		if (cmd.enabled
			&& msg.channel.type === 'text'
			&& settings.disable.commands.length > 0
			&& settings.disable.commands.includes(cmd.name))
			throw i18n.get('INHIBITOR_DISABLED');
	}

};
