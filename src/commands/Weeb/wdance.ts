const { WeebCommand } = require('../../index');

module.exports = class extends WeebCommand {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			description: (language) => language.get('COMMAND_WDANCE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_WDANCE_EXTENDED'),
			queryType: 'dance',
			responseName: 'COMMAND_WDANCE'
		});
	}

};
