import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 5,
			description: 'Get the information from a case by its index.',
			permissionLevel: 5,
			requiredPermissions: ['EMBED_LINKS'],
			runIn: ['text'],
			usage: '<Case:integer>'
		});
	}

	public async run(message: KlasaMessage, [index]: [number]) {
		const modlog = await message.guild!.moderation.fetch(index);
		if (modlog) return message.sendEmbed(await modlog.prepareEmbed());
		throw message.language.tget('COMMAND_REASON_NOT_EXISTS');
	}

}
