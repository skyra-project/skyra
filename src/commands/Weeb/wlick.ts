const { WeebCommand } = require('../../index');

module.exports = class extends WeebCommand {

	public constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			description: (language) => language.get('COMMAND_WLICK_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_WLICK_EXTENDED'),
			queryType: 'lick',
			responseName: 'COMMAND_WLICK',
			usage: '<user:username>'
		});
	}

};
