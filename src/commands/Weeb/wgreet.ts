import { WeebCommand } from '@lib/structures/WeebCommand';
import { CommandStore } from 'klasa';

export default class extends WeebCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: (language) => language.get('commandWgreetDescription'),
			extendedHelp: (language) => language.get('commandWgreetExtended'),
			queryType: 'greet',
			responseName: 'commandWgreet',
			usage: '<user:username>'
		});
	}
}
