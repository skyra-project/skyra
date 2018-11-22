import { WeebCommand } from '../../index';

export default class extends WeebCommand {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			description: (language) => language.get('COMMAND_WSTARE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_WSTARE_EXTENDED'),
			queryType: 'stare',
			responseName: 'COMMAND_WSTARE',
			usage: '<user:username>'
		});
	}

};
