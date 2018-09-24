const { WeebCommand } = require('../../index');

module.exports = class extends WeebCommand {

	public constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			description: (language) => language.get('COMMAND_WPOUT_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_WPOUT_EXTENDED'),
			queryType: 'pout',
			responseName: 'COMMAND_WPOUT'
		});
	}

};
