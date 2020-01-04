import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: language => language.tget('COMMAND_WARNINGS_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_WARNINGS_EXTENDED'),
			permissionLevel: PermissionLevels.Moderator,
			requiredPermissions: ['EMBED_LINKS', 'MANAGE_MESSAGES'],
			runIn: ['text'],
			usage: '[user:username]'
		});
	}

	public run(message: KlasaMessage, [target]: [KlasaUser?]) {
		const moderations = this.store.get('moderations') as unknown as Moderations | undefined;
		if (typeof moderations === 'undefined') throw new Error('Moderations command not loaded yet.');
		return moderations.run(message, ['warnings', target]);
	}

}

interface Moderations extends SkyraCommand {
	run(message: KlasaMessage, args: ['mutes' | 'warnings' | 'all', KlasaUser | undefined]): Promise<KlasaMessage>;
}
