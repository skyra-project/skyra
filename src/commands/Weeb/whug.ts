const { WeebCommand } = require('../../index');

module.exports = class extends WeebCommand {

	public constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			description: (language) => language.get('COMMAND_WHUG_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_WHUG_EXTENDED'),
			queryType: 'hug',
			responseName: 'COMMAND_WHUG',
			usage: '<user:username>'
		});
	}

};
