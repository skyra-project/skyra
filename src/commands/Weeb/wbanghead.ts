import { WeebCommand } from '@lib/structures/WeebCommand';
import { CommandStore } from 'klasa';

export default class extends WeebCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: (language) => language.get('COMMAND_WBANGHEAD_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_WBANGHEAD_EXTENDED'),
			queryType: 'banghead',
			responseName: 'COMMAND_WBANGHEAD'
		});
	}
}
