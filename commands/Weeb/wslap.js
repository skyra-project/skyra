const { WeebCommand } = require('../../index');

module.exports = class extends WeebCommand {

	constructor(...args) {
		super(...args, {
			description: msg => msg.language.get('COMMAND_WSLAP_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_WSLAP_EXTENDED'),
			queryType: 'slap',
			responseName: 'COMMAND_WSLAP',
			usage: '<user:username>'
		});
	}

};
