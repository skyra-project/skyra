const { WeebCommand } = require('../../index');

module.exports = class extends WeebCommand {

	constructor(...args) {
		super(...args, {
			description: (language) => language.get('COMMAND_WBLUSH_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_WBLUSH_EXTENDED'),
			queryType: 'blush',
			responseName: 'COMMAND_WBLUSH'
		});
	}

};
