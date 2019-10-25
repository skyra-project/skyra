import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: language => language.tget('COMMAND_WARNINGS_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_WARNINGS_EXTENDED'),
			permissionLevel: 5,
			requiredPermissions: ['EMBED_LINKS', 'MANAGE_MESSAGES'],
			runIn: ['text'],
			usage: '[user:username]'
		});
	}

	private get moderations() {
		return this.store.get('moderations') as unknown as Moderations;
	}

	public run(message: KlasaMessage, [target]: [KlasaUser?]) {
		const { moderations } = this;
		if (moderations) return moderations.run(message, ['warnings', target]);
		throw new Error('Moderations command not loaded yet.');
	}

}

interface Moderations extends SkyraCommand {
	run(message: KlasaMessage, args: ['mutes' | 'warnings' | 'all', KlasaUser | undefined]): Promise<KlasaMessage>;
}
