const { WeebCommand } = require('../../index');

module.exports = class extends WeebCommand {

	constructor(...args) {
		super(...args, {
			description: (language) => language.get('COMMAND_WDANCE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_WDANCE_EXTENDED'),
			queryType: 'dance',
			responseName: 'COMMAND_WDANCE'
		});
	}

};
