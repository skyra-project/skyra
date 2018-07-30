const { WeebCommand } = require('../../index');

module.exports = class extends WeebCommand {

	constructor(...args) {
		super(...args, {
			description: (language) => language.get('COMMAND_WSMUG_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_WSMUG_EXTENDED'),
			queryType: 'smug',
			responseName: 'COMMAND_WSMUG'
		});
	}

};
