const { WeebCommand } = require('../../index');

module.exports = class extends WeebCommand {

	constructor(...args) {
		super(...args, {
			description: msg => msg.language.get('COMMAND_WNOM_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_WNOM_EXTENDED'),
			queryType: 'nom',
			responseName: 'COMMAND_WNOM'
		});
	}

};
