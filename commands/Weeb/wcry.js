const { WeebCommand } = require('../../index');

module.exports = class extends WeebCommand {

	constructor(...args) {
		super(...args, {
			description: msg => msg.language.get('COMMAND_WCRY_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_WCRY_EXTENDED'),
			queryType: 'cry',
			responseName: 'COMMAND_WCRY',
			usage: '<user:username>'
		});
	}

};
