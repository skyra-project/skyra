const { WeebCommand } = require('../../index');

module.exports = class extends WeebCommand {

	constructor(...args) {
		super(...args, {
			description: msg => msg.language.get('COMMAND_WPAT_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_WPAT_EXTENDED'),
			queryType: 'pat',
			responseName: 'COMMAND_WPAT',
			usage: '<user:username>'
		});
	}

};
