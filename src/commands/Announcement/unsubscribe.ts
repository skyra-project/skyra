import { KlasaMessage } from 'klasa';
import { SkyraCommand, SkyraCommandOptions } from '../../lib/structures/SkyraCommand';
import { announcementCheck, ApplyOptions } from '../../lib/util/util';

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 15,
	description: language => language.tget('COMMAND_UNSUBSCRIBE_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_UNSUBSCRIBE_EXTENDED'),
	requiredGuildPermissions: ['MANAGE_ROLES'],
	runIn: ['text']
})
export default class extends SkyraCommand {

	public async run(message: KlasaMessage) {
		const role = announcementCheck(message);
		await message.member!.roles.remove(role);
		return message.sendLocale('COMMAND_UNSUBSCRIBE_SUCCESS', [role.name]);
	}

}
