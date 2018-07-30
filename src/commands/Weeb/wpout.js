const { WeebCommand } = require('../../index');

module.exports = class extends WeebCommand {

	constructor(...args) {
		super(...args, {
			description: (language) => language.get('COMMAND_WPOUT_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_WPOUT_EXTENDED'),
			queryType: 'pout',
			responseName: 'COMMAND_WPOUT'
		});
	}

};
