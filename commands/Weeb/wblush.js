const { WeebCommand } = require('../../index');

module.exports = class extends WeebCommand {

	constructor(...args) {
		super(...args, {
			description: msg => msg.language.get('COMMAND_WBLUSH_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_WBLUSH_EXTENDED'),
			queryType: 'blush',
			responseName: 'COMMAND_WBLUSH'
		});
	}

};
