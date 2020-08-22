import { WeebCommand } from '@lib/structures/WeebCommand';
import { CommandStore } from 'klasa';

export default class extends WeebCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: (language) => language.get('COMMAND_WSLAP_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_WSLAP_EXTENDED'),
			queryType: 'slap',
			responseName: 'COMMAND_WSLAP',
			usage: '<user:username>'
		});
	}
}
