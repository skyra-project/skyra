const { WeebCommand } = require('../../index');

module.exports = class extends WeebCommand {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			description: (language) => language.get('COMMAND_WCRY_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_WCRY_EXTENDED'),
			queryType: 'cry',
			responseName: 'COMMAND_WCRY',
			usage: '<user:username>'
		});
	}

};
