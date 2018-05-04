const { WeebCommand } = require('../../index');

module.exports = class extends WeebCommand {

	constructor(...args) {
		super(...args, {
			description: msg => msg.language.get('COMMAND_WDANCE_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_WDANCE_EXTENDED'),
			queryType: 'dance',
			responseName: 'COMMAND_WDANCE'
		});
	}

};
