const { WeebCommand } = require('../../index');

module.exports = class extends WeebCommand {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			description: (language) => language.get('COMMAND_WCUDDLE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_WCUDDLE_EXTENDED'),
			queryType: 'cuddle',
			responseName: 'COMMAND_WCUDDLE',
			usage: '<user:username>'
		});
	}

};
