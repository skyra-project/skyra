const { WeebCommand } = require('../../index');

module.exports = class extends WeebCommand {

	constructor(...args) {
		super(...args, {
			description: msg => msg.language.get('COMMAND_WLICK_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_WLICK_EXTENDED'),
			queryType: 'lick',
			responseName: 'COMMAND_WLICK',
			usage: '<user:username>'
		});
	}

};
