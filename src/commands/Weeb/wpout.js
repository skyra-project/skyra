const { WeebCommand } = require('../../index');

module.exports = class extends WeebCommand {

	constructor(...args) {
		super(...args, {
			description: msg => msg.language.get('COMMAND_WPOUT_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_WPOUT_EXTENDED'),
			queryType: 'pout',
			responseName: 'COMMAND_WPOUT'
		});
	}

};
