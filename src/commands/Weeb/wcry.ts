import { WeebCommand } from '@lib/structures/WeebCommand';
import { CommandStore } from 'klasa';

export default class extends WeebCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: (language) => language.get('commandWcryDescription'),
			extendedHelp: (language) => language.get('commandWcryExtended'),
			queryType: 'cry',
			responseName: 'commandWcry',
			usage: '<user:username>'
		});
	}
}
