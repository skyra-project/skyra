const { WeebCommand } = require('../../index');

module.exports = class extends WeebCommand {

	public constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			description: (language) => language.get('COMMAND_WPAT_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_WPAT_EXTENDED'),
			queryType: 'pat',
			responseName: 'COMMAND_WPAT',
			usage: '<user:username>'
		});
	}

};
