const { WeebCommand } = require('../../index');

module.exports = class extends WeebCommand {

	constructor(...args) {
		super(...args, {
			description: (language) => language.get('COMMAND_WTICKLE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_WTICKLE_EXTENDED'),
			queryType: 'tickle',
			responseName: 'COMMAND_WTICKLE',
			usage: '<user:username>'
		});
	}

};
