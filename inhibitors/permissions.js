const { structures: { Inhibitor } } = require('../index');

module.exports = class extends Inhibitor {

	async run(msg, cmd, settings, i18n) {
		const { broke, permission } = await this.client.permissionLevels.run(msg, cmd.permLevel, settings);
		if (permission) return;
		throw broke ? i18n.get('INHIBITOR_PERMISSIONS') : true;
	}

};
