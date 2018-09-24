const { WeebCommand } = require('../../index');

module.exports = class extends WeebCommand {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			description: (language) => language.get('COMMAND_WTICKLE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_WTICKLE_EXTENDED'),
			queryType: 'tickle',
			responseName: 'COMMAND_WTICKLE',
			usage: '<user:username>'
		});
	}

};
