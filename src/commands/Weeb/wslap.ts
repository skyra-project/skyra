const { WeebCommand } = require('../../index');

module.exports = class extends WeebCommand {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			description: (language) => language.get('COMMAND_WSLAP_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_WSLAP_EXTENDED'),
			queryType: 'slap',
			responseName: 'COMMAND_WSLAP',
			usage: '<user:username>'
		});
	}

};
