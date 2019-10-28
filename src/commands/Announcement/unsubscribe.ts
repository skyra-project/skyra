import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { announcementCheck } from '../../lib/util/util';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 15,
			description: language => language.tget('COMMAND_UNSUBSCRIBE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_UNSUBSCRIBE_EXTENDED'),
			requiredGuildPermissions: ['MANAGE_ROLES'],
			runIn: ['text']
		});
	}

	public async run(message: KlasaMessage) {
		const role = announcementCheck(message);
		await message.member!.roles.remove(role);
		return message.sendLocale('COMMAND_UNSUBSCRIBE_SUCCESS', [role.name]);
	}

}
