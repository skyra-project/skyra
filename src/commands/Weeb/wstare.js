const { WeebCommand } = require('../../index');

module.exports = class extends WeebCommand {

	constructor(...args) {
		super(...args, {
			description: (language) => language.get('COMMAND_WSTARE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_WSTARE_EXTENDED'),
			queryType: 'stare',
			responseName: 'COMMAND_WSTARE',
			usage: '<user:username>'
		});
	}

};
