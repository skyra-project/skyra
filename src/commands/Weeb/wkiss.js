const { WeebCommand } = require('../../index');

module.exports = class extends WeebCommand {

	constructor(...args) {
		super(...args, {
			description: (language) => language.get('COMMAND_WKISS_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_WKISS_EXTENDED'),
			queryType: 'kiss',
			responseName: 'COMMAND_WKISS',
			usage: '<user:username>'
		});
	}

};
