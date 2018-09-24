const { WeebCommand } = require('../../index');

module.exports = class extends WeebCommand {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			description: (language) => language.get('COMMAND_WBLUSH_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_WBLUSH_EXTENDED'),
			queryType: 'blush',
			responseName: 'COMMAND_WBLUSH'
		});
	}

};
