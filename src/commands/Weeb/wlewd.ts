import { WeebCommand } from '@lib/structures/WeebCommand';
import { CommandStore } from 'klasa';

export default class extends WeebCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: (language) => language.get('commandWlewdDescription'),
			extendedHelp: (language) => language.get('commandWlewdExtended'),
			queryType: 'lewd',
			responseName: 'commandWlewd'
		});
	}
}
