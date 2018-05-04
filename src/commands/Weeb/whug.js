const { WeebCommand } = require('../../index');

module.exports = class extends WeebCommand {

	constructor(...args) {
		super(...args, {
			description: msg => msg.language.get('COMMAND_WHUG_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_WHUG_EXTENDED'),
			queryType: 'hug',
			responseName: 'COMMAND_WHUG',
			usage: '<user:username>'
		});
	}

};
