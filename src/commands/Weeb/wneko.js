const { WeebCommand } = require('../../index');

module.exports = class extends WeebCommand {

	constructor(...args) {
		super(...args, {
			description: msg => msg.language.get('COMMAND_WNEKO_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_WNEKO_EXTENDED'),
			queryType: 'neko',
			responseName: 'COMMAND_WNEKO'
		});
	}

};
