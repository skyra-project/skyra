const { WeebCommand } = require('../../index');

module.exports = class extends WeebCommand {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			description: (language) => language.get('COMMAND_WNEKO_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_WNEKO_EXTENDED'),
			queryType: 'neko',
			responseName: 'COMMAND_WNEKO'
		});
	}

};
