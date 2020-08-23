import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { announcementCheck } from '@utils/util';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 15,
			description: (language) => language.get('commandUnsubscribeDescription'),
			extendedHelp: (language) => language.get('commandUnsubscribeExtended'),
			requiredGuildPermissions: ['MANAGE_ROLES'],
			runIn: ['text']
		});
	}

	public async run(message: KlasaMessage) {
		const role = announcementCheck(message);
		await message.member!.roles.remove(role);
		return message.sendLocale('commandUnsubscribeSuccess', [{ role: role.name }]);
	}
}
