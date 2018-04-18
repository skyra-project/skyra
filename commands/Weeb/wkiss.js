const { WeebCommand } = require('../../index');

module.exports = class extends WeebCommand {

	constructor(...args) {
		super(...args, {
			description: msg => msg.language.get('COMMAND_WKISS_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_WKISS_EXTENDED'),
			queryType: 'kiss',
			responseName: 'COMMAND_WKISS',
			usage: '<user:username>'
		});
	}

};
